-- Logo de banco/billetera (URL absoluta o ruta local, ej. /banks/brou.png)
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS logo_url TEXT;
