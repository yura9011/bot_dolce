const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ADMIN_NUMBERS_PATH = path.join(__dirname, '..', 'config', 'admin-numbers.json');

if (fs.existsSync(ADMIN_NUMBERS_PATH)) {
  console.log('⚠️  admin-numbers.json ya existe. Haz backup antes de migrar.');
  process.exit(1);
}

const envValue = process.env.ADMIN_NUMBERS;
if (!envValue) {
  console.log('❌ No hay ADMIN_NUMBERS en .env');
  process.exit(1);
}

const ids = envValue.split(',').map(n => n.trim()).filter(n => n.length > 0);
const config = {
  admins: ids.map(id => ({
    id,
    nombre: 'Migrado desde .env',
    rol: 'admin',
    agregadoPor: 'sistema',
    fechaAgregado: new Date().toISOString()
  }))
};

fs.writeFileSync(ADMIN_NUMBERS_PATH, JSON.stringify(config, null, 2), 'utf8');
console.log(`✅ Migración completada: ${ids.length} números migrados a ${ADMIN_NUMBERS_PATH}`);
