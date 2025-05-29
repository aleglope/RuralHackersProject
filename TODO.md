# Proyecto de Colaboración con Rural Hackers

Aplicación diseñada para facilitar la recepción de datos de transporte para Equilátero DSC, empresa que calcula las huellas de carbono de distintos eventos. Por otro lado, permitiría la visibilidad de la contribución individual al conjunto (del evento o del tipo de transporte) y también la visibilidad de la mejora del transporte realizado respecto a la opción de transporte menos sostenible.

## Modificaciones propuestas 20/5/25:

### Cambios genéricos:

- [x] 1. En la pantalla inicial, al pulsar el botón de las barras que lleva a la página de Resultados agregados de todos los trayectos, debe mostrar solo resultados agregados. (`EventSelection.tsx`) - _Nota: Se modificó el botón para que muestre el texto "Resultados Agregados" además del icono. El botón sigue llevando a los resultados del evento específico._
  - Rama: `feature/home-aggregated-results`
- [x] 2. Huella de carbono total hay que cambiarlo por Huella de carbono (transporte + alojamiento). (`EventResults.tsx`, `ResultsSection.tsx`)
  - Rama: `feature/carbon-footprint-transport-accommodation`
- [x] 3. Total de participantes no tiene sentido mostrarlo, aunque sí se puede indicar el número de personas de las que se reportaron datos de transporte y el número de personas de las que se reportaron datos de alojamiento. El total de participantes en el evento es una cifra distinta y ponerlo puede llevar a error. (`EventResults.tsx`, `ResultsSection.tsx`) - **Completado: Se modificó `EventResults.tsx` para mostrar el recuento de personas con datos de transporte y alojamiento reportados, y se actualizaron las traducciones.**
  - Rama: `feature/participant-type-reporting`
- [x] 4. Ahora mismo parece que no funciona bien ese dato, ya que pone que el total de participantes son 5, mostrando por tipo de usuario 1 de público, 13 de proveedores, 7 de logística, 3 de participantes y 1 de personal. Revisarlo. (`ResultsSection.tsx`, `EventResults.tsx`) - **Completado: Abordado con los cambios del punto 3, que modifican cómo se presenta esta información.**
  - Rama: `feature/participant-type-reporting` (o `bugfix/participant-count-display`)
- [x] 5. En la pantalla de tipo de transporte debería poner Tipología de persona usuaria. En el caso de seleccionar "otro", debe obligarse a especificarlo (con un cuadro de introducción de texto). (`TravelForm.tsx`, `TravelSegment.tsx`) - **Completado: Se cambió la etiqueta a "Tipología de persona usuaria", se hizo obligatorio especificar "Otro" y se actualizaron esquemas, tipos y traducciones.**
  - Rama: `feature/user-typology-selection`

### En la pantalla de tramos del viaje:

- [x] 6. Debe verse la tipología de persona usuaria seleccionada anteriormente. La distancia tiene que ser opcional rellenarla, pero origen y destino, obligatorios. En tipo de vehículo, tiene que haber posibilidad de especificar en caso de elegir "otro". (`TravelForm.tsx`, `TravelSegment.tsx`) - **Completado: Se mostró la tipología de usuario, se hicieron obligatorios origen y destino, y se añadió campo condicional para 'otro' vehículo.**
  - Rama: `feature/travel-segments-basic-fields`
- [x] 7. Quitar la opción de ida y vuelta. Queda más simple indicando solo la frecuencia (número de viajes). (`TravelSegment.tsx`, `TravelForm.tsx`) - **Completado: Se eliminó la opción 'ida y vuelta', usando solo frecuencia.**
  - Rama: `feature/travel-segments-frequency-dates`
- [x] 8. Tiene que haber dos fechas (desde y hasta), de manera que si coinciden, todo el tramo fue realizado en un mismo día, y si hay un intervalo, se realizó en ese período. En tipo de combustible, tiene que haber la opción de "combustible desconocido" en el caso de seleccionar moto, coche, furgoneta, autobús y camión. (`TravelSegment.tsx`, `TravelForm.tsx`) - **Completado: Se implementaron fechas 'desde/hasta' (con validación y restricción de no poder seleccionar días anteriores al actual), se añadió 'combustible desconocido' y se corrigieron placeholders de selectores.**
  - Rama: `feature/travel-segments-frequency-dates` (para las fechas) y `feature/travel-segments-fuel-emission-offset` (para el combustible)
- [x] 9. El autobús tiene que tener opción de seleccionar el tipo de combustible.
  - Rama: `feature/travel-segments-fuel-emission-offset`
- [x] 10. Se tiene que poder introducir el número de personas para cualquier tipo de vehículo, ya que una persona que completa el cuestionario tiene que poder decir, por ejemplo, que 25 personas vinieron en bicicleta desde donde sea. El punto anterior implica que en el caso de coche, moto, autobús, furgoneta y camión, tienen que indicar el número de vehículos utilizados (tren y avión no necesitan esta opción). (`TravelForm.tsx`, `TravelSegment.tsx`) - **Completado: Se permite introducir nº de personas para todos los vehículos y nº de vehículos para coche, moto, bus, furgoneta y camión. Actualizados tipos, Zod, valores por defecto, guardado en BBDD y UI.**
  - Rama: `feature/travel-segments-people-vehicles`
- [x] 11. Tren y autobús tienen que tener la opción de que la compañía compense las emisiones, igual que está en el caso del avión. (`TravelForm.tsx`, `TravelSegment.tsx`) - **Completado: Se añadió checkbox de compensación para tren y autobús en la UI, y la lógica de cálculo aplica la reducción.**
  - Rama: `feature/travel-segments-fuel-emission-offset`
- [x] 12. Hay que poner un ejemplo debajo de tramos de viaje, para que las personas entiendan que los tramos hacen referencia a los distintos tipos de transporte utilizados y/o a los propios trayectos realizados: Una persona que va de Barcelona a Santiago en avión, durante tres días hace ida y vuelta entre Santiago y Portas en coche y finalmente vuelve de Santiago a Barcelona en avión, debe poner un tramo para el viaje en avión (número de viajes, 2) y pulsar en "añadir otro tramo" para añadir los viajes en coche (número de viajes, 6). (`TravelForm.tsx`, `TravelSegment.tsx`) - **Completado: Se añadió texto explicativo con un ejemplo en la sección de tramos del viaje.**
  - Rama: `feature/travel-segments-example`

### Otros:

- [ ] 13. Aunque el evento Portamérica 2025 está bien guardado para hacer modificaciones después, ahora urge más el Campeonato Mundial de Triatlón Multideporte Pontevedra 2025.

### La tipología de personas usuarias en el caso del Campeonato Mundial de Triatlón Multideporte Pontevedra 2025 es:

- [ ] 14. Asistentes acreditados al EVENTO , diferenciando entre: LOC, VIP, Timing, Foto, Medios, Producción de TV, Delegaciones deportivas, otro (especificar). Personas que trabajan para preparar y organizar el evento , incluyendo los servicios de transporte del personal. (Deben tener un espacio para especificar, por ejemplo, descripción). Servicios de transporte prestados a otras partes interesadas , eligiendo entre autobuses lanzadera para los espectadores y servicios de transporte para los equipos (aeropuerto-sede). Público. Proveedores. El alojamiento solo hay que pedirlo a asistentes acreditados al evento y al público. (`TravelForm.tsx`, `TravelSegment.tsx`, posiblemente `Database.ts` si hay nuevos enums o tablas)
  - Rama: `feature/event-pontevedra-2025-config`

## Ramas de desarrollo:

- `feature/home-aggregated-results`
- `feature/carbon-footprint-transport-accommodation`
- `feature/participant-type-reporting`
- `feature/user-typology-selection`
- `feature/travel-segments-basic-fields`
- `feature/travel-segments-frequency-dates`
- `feature/travel-segments-fuel-emission-offset`
- `feature/travel-segments-people-vehicles`
- `feature/travel-segments-example`
- `feature/event-pontevedra-2025-config`

### Ramas auxiliares (opcional):

- `refactor/travel-segment-components`
- `chore/i18n-spanish-translations`
- `bugfix/participant-count-display`
