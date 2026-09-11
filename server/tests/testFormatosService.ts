import {
  listarFormatosService,
  obtenerFormatoService,
  listarMapeosService,
} from '../src/modules/bancos/formatos-importacion/formatosImportacion.service.js';

async function main() {
  try {
    console.log('\n========== PRUEBA 1: LISTAR FORMATOS ==========\n');

    const formatos = await listarFormatosService();
    console.table(formatos);

    console.log('\n========== PRUEBA 2: OBTENER FORMATO ID 1 ==========\n');

    const formato = await obtenerFormatoService(1);
    console.log(formato);

    console.log('\n========== PRUEBA 3: LISTAR MAPEOS FORMATO 1 ==========\n');

    const mapeos = await listarMapeosService(1);
    console.table(mapeos);

    console.log('\n==============================================');
    console.log('TODAS LAS PRUEBAS DEL SERVICE FINALIZARON');
    console.log('==============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\nERROR DURANTE LAS PRUEBAS DEL SERVICE:');
    console.error(error);

    process.exit(1);
  }
}

main();