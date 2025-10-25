# Linku Meet Functions

Sistema de integración con Google Meet y Google Calendar para la gestión de reuniones.

## Arquitectura

Este repositorio contiene las funciones específicas del dominio de Google Meet como parte del ecosistema Linku microservicios.

- **Repositorio Principal**: linku-core (orquestrador)  
- **Este Repositorio**: linku-meet-functions (dominio de Meet)

## Características

- Integración completa con Google Meet API
- Gestión de eventos de Google Calendar
- Creación automática de enlaces de Meet
- Notificaciones y recordatorios
- Autenticación OAuth 2.0

## Funciones Exportadas

### Gestión de Reuniones
- `meetCreateMeeting`: Crea nueva reunión con enlace Meet
- `meetListMeetings`: Lista reuniones programadas
- `meetUpdateMeeting`: Actualiza detalles de reunión
- `meetDeleteMeeting`: Cancela/elimina reunión

### Utilidades
- `meetGetMeetingDetails`: Obtiene información detallada
- `meetSendInvitations`: Envía invitaciones por email

## Instalación

```bash
npm install
```

## Configuración

### Credenciales de Google API
Configura en Firebase Remote Config:

```json
{
  "google": {
    "clientId": "your-client-id.googleusercontent.com",
    "clientSecret": "your-client-secret",
    "refreshToken": "your-refresh-token"
  }
}
```

### Configuración OAuth 2.0
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea proyecto y habilita APIs:
   - Google Calendar API
   - Google Meet API
3. Configura pantalla de consentimiento OAuth
4. Crea credenciales OAuth 2.0

## Uso

```typescript
// Crear reunión
const meeting = await meetCreateMeeting({
  title: 'Reunión Equipo',
  description: 'Reunión semanal del equipo',
  startTime: '2024-01-15T10:00:00Z',
  endTime: '2024-01-15T11:00:00Z',
  attendees: ['user1@example.com', 'user2@example.com']
});

// Listar reuniones
const meetings = await meetListMeetings({
  timeMin: '2024-01-01T00:00:00Z',
  timeMax: '2024-01-31T23:59:59Z',
  maxResults: 10
});

// Actualizar reunión
const updated = await meetUpdateMeeting({
  meetingId: 'meeting_id_here',
  updates: {
    title: 'Nuevo título',
    startTime: '2024-01-15T11:00:00Z'
  }
});
```

## Desarrollo

### Tests
```bash
npm test
```

### Build
```bash
npm run build
```

### Deploy Meet Functions
```bash
# Deploy todas las funciones de Meet
firebase deploy --only functions:meet

# Deploy función específica
firebase deploy --only functions:meetCreateMeeting
```

## APIs Integradas

### Google Calendar API
- Creación y gestión de eventos
- Sincronización de calendarios
- Configuración de recordatorios

### Google Meet API
- Generación automática de enlaces
- Configuración de salas virtuales
- Grabación y transcripción (premium)

## Flujos de Trabajo

### Crear Reunión Completa
1. Validar datos de entrada
2. Autenticar con Google APIs
3. Crear evento en Calendar
4. Generar enlace Meet
5. Enviar invitaciones
6. Configurar recordatorios

### Gestión de Invitados
- Adición/remoción de participantes
- Envío de actualizaciones
- Seguimiento de asistencia

## Contribución

1. Fork este repositorio específico
2. Crea rama feature: `git checkout -b feature/meet-improvement`
3. Commit cambios: `git commit -m 'feat: add meeting recording'`
4. Push: `git push origin feature/meet-improvement`
5. Crear Pull Request

## Licencia

MIT License