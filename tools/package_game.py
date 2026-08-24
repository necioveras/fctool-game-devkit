#!/usr/bin/env python3
import sys, zipfile
from pathlib import Path
from validator import validate_dir

def main():
    if len(sys.argv)!=3:
        print('Uso: package_game.py <diretório-do-jogo> <saida.zip>'); return 2
    root=Path(sys.argv[1]); out=Path(sys.argv[2])
    errors=validate_dir(root)
    if errors:
        print('PACOTE INVÁLIDO')
        for e in errors: print(' -',e)
        return 1
    out.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
        for p in root.rglob('*'):
            if p.is_file(): z.write(p,p.relative_to(root).as_posix())
    print(f'ZIP criado: {out}')
    return 0
if __name__=='__main__': raise SystemExit(main())
