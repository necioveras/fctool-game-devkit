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

def _select_value(option):
    return option.get('value') if isinstance(option, dict) else option

def validate_manifest(m, exists):
    errors=[]
    for k in ['fctoolGame','id','name','version','entrypoint','metadata','capabilities','responsive']:
        if k not in m: errors.append(f"campo obrigatório ausente: {k}")
    if m.get('fctoolGame') != '1.0': errors.append('fctoolGame deve ser "1.0"')
    if not ID_RE.match(str(m.get('id',''))): errors.append('id inválido')
    if not VER_RE.match(str(m.get('version',''))): errors.append('version deve seguir SemVer X.Y.Z')
    ep = m.get('entrypoint','')
    if not safe_name(str(ep)) or not str(ep).lower().endswith(('.html','.htm')): errors.append('entrypoint inválido')
    elif not exists(ep): errors.append(f'entrypoint não encontrado: {ep}')
    md=m.get('metadata',{})
    if not isinstance(md, dict) or not md.get('description'): errors.append('metadata.description é obrigatório')
    elif isinstance(md, dict):
        for k in ['suggestedAreas','suggestedSubjects','suggestedTopics','suggestedEducationLevels','keywords']:
            if k in md and (not isinstance(md[k], list) or any(not isinstance(v, str) or not v.strip() for v in md[k])):
                errors.append(f'metadata.{k} deve ser uma lista de textos não vazios')
    caps=m.get('capabilities',{})
    if not isinstance(caps, dict) or caps.get('completion') is not True: errors.append('capabilities.completion deve ser true')
    conf=m.get('configuration',{})
    if not isinstance(conf,dict): errors.append('configuration deve ser objeto')
    else:
        for name,field in conf.items():
            prefix=f'configuration.{name}'
            if not re.match(r'^[A-Za-z][A-Za-z0-9_-]{0,79}$', str(name)):
                errors.append(f'{prefix}: nome de chave inválido')
            if not isinstance(field,dict): errors.append(f'{prefix} deve ser objeto'); continue
            typ=field.get('type')
            if typ not in {'boolean','number','text','select'}: errors.append(f'{prefix}.type inválido')
            if not isinstance(field.get('label'),str) or not field.get('label','').strip(): errors.append(f'{prefix}.label obrigatório')
            default=field.get('default', None); has_default='default' in field
            if typ=='boolean' and has_default and not isinstance(default,bool): errors.append(f'{prefix}.default deve ser boolean')
            if typ=='text' and has_default and not isinstance(default,str): errors.append(f'{prefix}.default deve ser texto')
            if typ=='number':
                if has_default and (isinstance(default,bool) or not isinstance(default,(int,float))): errors.append(f'{prefix}.default deve ser número')
                for lim in ('min','max','step'):
                    if lim in field and (isinstance(field[lim],bool) or not isinstance(field[lim],(int,float))): errors.append(f'{prefix}.{lim} deve ser número')
                if isinstance(field.get('step'),(int,float)) and not isinstance(field.get('step'),bool) and field['step']<=0: errors.append(f'{prefix}.step deve ser > 0')
                if isinstance(field.get('min'),(int,float)) and isinstance(field.get('max'),(int,float)) and field['min']>field['max']: errors.append(f'{prefix}.min não pode ser maior que max')
                if has_default and isinstance(default,(int,float)) and not isinstance(default,bool):
                    if isinstance(field.get('min'),(int,float)) and default<field['min']: errors.append(f'{prefix}.default menor que min')
                    if isinstance(field.get('max'),(int,float)) and default>field['max']: errors.append(f'{prefix}.default maior que max')
            if typ=='select':
                opts=field.get('options')
                if not isinstance(opts,list) or not opts: errors.append(f'{prefix}.options obrigatório para select')
                else:
                    values=[]
                    for i,opt in enumerate(opts):
                        if isinstance(opt,dict):
                            if set(opt)-{'value','label'} or 'value' not in opt or 'label' not in opt or not isinstance(opt.get('label'),str) or not opt.get('label','').strip() or isinstance(opt.get('value'),bool) or not isinstance(opt.get('value'),(str,int,float)):
                                errors.append(f'{prefix}.options[{i}] deve ser valor string/número ou objeto {{value,label}} válido'); continue
                        elif isinstance(opt,bool) or not isinstance(opt,(str,int,float)):
                            errors.append(f'{prefix}.options[{i}] deve ser string/número ou objeto {{value,label}}'); continue
                        values.append(_select_value(opt))
                    if len(values)!=len(set(map(lambda v:(type(v).__name__,str(v)),values))): errors.append(f'{prefix}.options contém valores duplicados')
                    if has_default and default not in values: errors.append(f'{prefix}.default deve existir em options')
            if field.get('required') is True and not has_default:
                # válido: professor será obrigado a escolher; apenas informativo, sem erro
                pass
    resp=m.get('responsive',{})
    if not isinstance(resp,dict) or resp.get('touch') is not True: errors.append('responsive.touch deve ser true')
    if isinstance(resp,dict) and (not isinstance(resp.get('orientations'),list) or not resp.get('orientations')): errors.append('responsive.orientations deve conter ao menos uma orientação')
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
