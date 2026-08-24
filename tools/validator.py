#!/usr/bin/env python3
import json, re, sys, zipfile
from pathlib import Path, PurePosixPath

MAX_FILES = 2000
MAX_ZIP = 50 * 1024 * 1024
MAX_UNPACKED = 150 * 1024 * 1024
ALLOWED = {'.html','.htm','.js','.mjs','.css','.json','.png','.jpg','.jpeg','.webp','.svg','.gif','.mp3','.ogg','.wav','.woff','.woff2','.ttf','.map','.txt'}
ID_RE = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
VER_RE = re.compile(r'^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$')

class ValidationError(Exception): pass

def safe_name(name):
    p = PurePosixPath(name)
    return not p.is_absolute() and '..' not in p.parts and '\\' not in name and '\x00' not in name

def validate_manifest(m, exists):
    errors=[]
    for k in ['fctoolGame','id','name','version','entrypoint','metadata','capabilities']:
        if k not in m: errors.append(f"campo obrigatório ausente: {k}")
    if m.get('fctoolGame') != '1.0': errors.append('fctoolGame deve ser "1.0"')
    if not ID_RE.match(str(m.get('id',''))): errors.append('id inválido')
    if not VER_RE.match(str(m.get('version',''))): errors.append('version deve seguir SemVer X.Y.Z')
    ep = m.get('entrypoint','')
    if not safe_name(str(ep)) or not str(ep).lower().endswith(('.html','.htm')): errors.append('entrypoint inválido')
    elif not exists(ep): errors.append(f'entrypoint não encontrado: {ep}')
    md=m.get('metadata',{})
    if not md.get('description'): errors.append('metadata.description é obrigatório')
    for k in ['suggestedAreas','suggestedSubjects','suggestedTopics','suggestedEducationLevels','keywords']:
        if k in md and (not isinstance(md[k], list) or any(not isinstance(v, str) or not v.strip() for v in md[k])):
            errors.append(f'metadata.{k} deve ser uma lista de textos não vazios')
    caps=m.get('capabilities',{})
    if caps.get('completion') is not True: errors.append('capabilities.completion deve ser true')
    conf=m.get('configuration',{})
    if not isinstance(conf,dict): errors.append('configuration deve ser objeto')
    else:
        for name,field in conf.items():
            if not isinstance(field,dict): errors.append(f'configuration.{name} deve ser objeto'); continue
            typ=field.get('type')
            if typ not in {'boolean','number','text','select'}: errors.append(f'configuration.{name}.type inválido')
            if not field.get('label'): errors.append(f'configuration.{name}.label obrigatório')
            if typ=='select' and not field.get('options'): errors.append(f'configuration.{name}.options obrigatório para select')
    return errors

def validate_dir(root):
    root=Path(root)
    if not root.is_dir(): raise ValidationError('diretório inexistente')
    files=[p for p in root.rglob('*') if p.is_file()]
    if len(files)>MAX_FILES: raise ValidationError(f'arquivos demais: {len(files)} > {MAX_FILES}')
    total=0; errors=[]
    for p in files:
        rel=p.relative_to(root).as_posix(); total += p.stat().st_size
        if not safe_name(rel): errors.append(f'caminho inseguro: {rel}')
        if p.suffix.lower() not in ALLOWED: errors.append(f'extensão não permitida: {rel}')
        if p.is_symlink(): errors.append(f'link simbólico não permitido: {rel}')
    if total>MAX_UNPACKED: errors.append('tamanho descompactado excede o limite')
    mf=root/'manifest.json'
    if not mf.exists(): errors.append('manifest.json ausente na raiz')
    else:
        try: m=json.loads(mf.read_text(encoding='utf-8'))
        except Exception as e: errors.append(f'manifest.json inválido: {e}'); m=None
        if m: errors += validate_manifest(m, lambda x:(root/x).is_file())
    return errors

def validate_zip(path):
    path=Path(path)
    errors=[]
    if path.stat().st_size>MAX_ZIP: errors.append('ZIP excede limite compactado')
    with zipfile.ZipFile(path) as z:
        infos=z.infolist()
        if len(infos)>MAX_FILES: errors.append('arquivos demais no ZIP')
        total=sum(i.file_size for i in infos)
        if total>MAX_UNPACKED: errors.append('ZIP excede limite descompactado')
        names=set(i.filename for i in infos if not i.is_dir())
        for i in infos:
            if i.is_dir(): continue
            if not safe_name(i.filename): errors.append(f'caminho inseguro: {i.filename}')
            if Path(i.filename).suffix.lower() not in ALLOWED: errors.append(f'extensão não permitida: {i.filename}')
            # Unix symlink bit
            if (i.external_attr >> 16) & 0o170000 == 0o120000: errors.append(f'link simbólico não permitido: {i.filename}')
        if 'manifest.json' not in names: errors.append('manifest.json ausente na raiz')
        else:
            try: m=json.loads(z.read('manifest.json').decode('utf-8'))
            except Exception as e: errors.append(f'manifest.json inválido: {e}'); m=None
            if m: errors += validate_manifest(m, lambda x:x in names)
    return errors

def main():
    if len(sys.argv)!=2:
        print('Uso: validator.py <diretório-ou-zip>'); return 2
    p=Path(sys.argv[1])
    try:
        errors=validate_dir(p) if p.is_dir() else validate_zip(p)
    except Exception as e:
        print('ERRO:', e); return 2
    if errors:
        print('PACOTE INVÁLIDO')
        for e in errors: print(' -',e)
        return 1
    print('PACOTE VÁLIDO - FCTool Game Protocol/Manifest 1.0')
    return 0
if __name__=='__main__': raise SystemExit(main())
