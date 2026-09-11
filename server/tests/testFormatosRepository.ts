import {
  listarFormatos,
  obtenerFormato,
  crearFormato,
  actualizarFormato,
  cambiarEstadoFormato,
  listarMapeos,
  crearMapeo,
  actualizarMapeo,
  eliminarMapeo,
} from '../src/modules/bancos/formatos-importacion/formatosImportacion.repository.js';

async function main() {
  try {
    console.log('\n========== PRUEBA 1: CREAR FORMATO ==========\n');

    const nuevoFormatoId = await crearFormato({
      bancoId: 1,
      nombre: 'FORMATO TEMPORAL TEST',
      version: 1,
      tipoArchivo: 'CSV',
      delimitador: ';',
      formatoFecha: 'DD/MM/YYYY',
      filaEncabezado: 1,
      archivoEjemploId: 1,
      estado: 'ACTIVO',
    });

    console.log('Formato creado con ID:', nuevoFormatoId);

    console.log('\n========== PRUEBA 2: OBTENER FORMATO CREADO ==========\n');

    const formatoCreado = await obtenerFormato(nuevoFormatoId);
    console.log(formatoCreado);

    console.log('\n========== PRUEBA 3: ACTUALIZAR FORMATO ==========\n');

    await actualizarFormato({
      formatoId: nuevoFormatoId,
      bancoId: 1,
      nombre: 'FORMATO TEMPORAL ACTUALIZADO',
      version: 2,
      tipoArchivo: 'CSV',
      delimitador: ',',
      formatoFecha: 'YYYY-MM-DD',
      filaEncabezado: 2,
      archivoEjemploId: 1,
    });

    const formatoActualizado = await obtenerFormato(nuevoFormatoId);
    console.log(formatoActualizado);

    console.log('\n========== PRUEBA 4: CAMBIAR ESTADO ==========\n');

    await cambiarEstadoFormato(
      nuevoFormatoId,
      'INACTIVO'
    );

    const formatoInactivo = await obtenerFormato(nuevoFormatoId);
    console.log(formatoInactivo);

    console.log('\n========== PRUEBA 5: CREAR MAPEO ==========\n');

    const nuevoMapeoId = await crearMapeo({
      formatoId: nuevoFormatoId,
      campoSistema: 'FECHA_VALOR',
      nombreColumna: 'Fecha Valor',
      numeroColumna: 1,
      esObligatorio: 'S',
      formatoValor: 'YYYY-MM-DD',
    });

    console.log('Mapeo creado con ID:', nuevoMapeoId);

    console.log('\n========== PRUEBA 6: LISTAR MAPEOS ==========\n');

    let mapeos = await listarMapeos(nuevoFormatoId);
    console.table(mapeos);

    console.log('\n========== PRUEBA 7: ACTUALIZAR MAPEO ==========\n');

    await actualizarMapeo({
      mapeoId: nuevoMapeoId,
      campoSistema: 'FECHA_VALOR',
      nombreColumna: 'Fecha de Valor',
      numeroColumna: 2,
      esObligatorio: 'N',
      formatoValor: 'DD/MM/YYYY',
    });

    mapeos = await listarMapeos(nuevoFormatoId);
    console.table(mapeos);

    console.log('\n========== PRUEBA 8: ELIMINAR MAPEO ==========\n');

    await eliminarMapeo(nuevoMapeoId);

    mapeos = await listarMapeos(nuevoFormatoId);
    console.table(mapeos);

    console.log('\n========== PRUEBA 9: LISTADO GENERAL ==========\n');

    const formatos = await listarFormatos();
    console.table(formatos);

    console.log('\n==============================================');
    console.log('TODAS LAS PRUEBAS DE ESCRITURA FINALIZARON');
    console.log('==============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\nERROR EN LAS PRUEBAS DEL REPOSITORY:');
    console.error(error);

    process.exit(1);
  }
}

main();