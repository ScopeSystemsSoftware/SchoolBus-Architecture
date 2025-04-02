import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsResponse,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from '../../auth/guards/ws-jwt.guard';
import { TenantService } from '../../tenant/tenant.service';
import { LiveTrackingService } from '../services/live-tracking.service';
import { LocationUpdateDto } from '../dto/location-update.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/tracking',
})
@Injectable()
export class LiveTrackingGateway 
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(LiveTrackingGateway.name);
  
  // Map pentru a păstra track de conexiuni per tenant
  private tenantRooms = new Map<string, Set<string>>();
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly tenantService: TenantService,
    private readonly liveTrackingService: LiveTrackingService,
  ) {}

  afterInit() {
    this.logger.log('Live Tracking Gateway Inițializat');
  }

  async handleConnection(client: Socket) {
    try {
      // Extrage și verifică token-ul JWT
      const token = client.handshake.headers.authorization?.split(' ')[1] || 
                   client.handshake.auth.token;
      
      if (!token) {
        this.logger.warn('Conexiune refuzată: lipsă token');
        client.disconnect();
        return;
      }
      
      // Verifică token-ul și extrage tenant-ul și user-ul
      const payload = this.jwtService.verify(token);
      const { sub: userId, tenantId } = payload;
      
      if (!tenantId) {
        this.logger.warn('Conexiune refuzată: lipsă tenant ID în token');
        client.disconnect();
        return;
      }
      
      // Verifică dacă tenant-ul este valid
      const isValid = await this.tenantService.isTenantValid(tenantId);
      if (!isValid) {
        this.logger.warn(`Conexiune refuzată: tenant invalid - ${tenantId}`);
        client.disconnect();
        return;
      }
      
      // Adaugă informații la socket pentru utilizare ulterioară
      client.data.userId = userId;
      client.data.tenantId = tenantId;
      
      // Adaugă clientul în camera tenant-ului
      const roomName = `tenant:${tenantId}`;
      await client.join(roomName);
      
      // Păstrează evidența conexiunilor per tenant
      if (!this.tenantRooms.has(tenantId)) {
        this.tenantRooms.set(tenantId, new Set());
      }
      this.tenantRooms.get(tenantId).add(client.id);
      
      this.logger.log(`Client conectat: ${client.id} pentru tenant: ${tenantId}`);
      
      // Trimite ultimele locații cunoscute pentru acest tenant
      const latestLocations = await this.liveTrackingService.getLatestLocations(tenantId);
      client.emit('initialLocations', latestLocations);
      
    } catch (error) {
      this.logger.error(`Eroare la autentificarea conexiunii: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const { tenantId } = client.data;
    
    if (tenantId && this.tenantRooms.has(tenantId)) {
      this.tenantRooms.get(tenantId).delete(client.id);
      
      // Dacă nu mai sunt conexiuni pentru acest tenant, curăță map-ul
      if (this.tenantRooms.get(tenantId).size === 0) {
        this.tenantRooms.delete(tenantId);
      }
    }
    
    this.logger.log(`Client deconectat: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('updateLocation')
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: LocationUpdateDto,
  ): Promise<WsResponse<any>> {
    try {
      const { tenantId } = client.data;
      
      if (!tenantId) {
        throw new Error('Tenant ID lipsă din context');
      }
      
      // Adaugă automat tenantId la date
      const locationWithTenant = { 
        ...data, 
        tenantId,
        timestamp: data.timestamp || new Date().toISOString(),
      };
      
      // Salvează locația în baza de date
      await this.liveTrackingService.saveLocation(locationWithTenant);
      
      // Transmite locația actualizată către toți clienții din același tenant
      const roomName = `tenant:${tenantId}`;
      this.server.to(roomName).emit('locationUpdate', locationWithTenant);
      
      return { event: 'locationUpdateStatus', data: { success: true } };
    } catch (error) {
      this.logger.error(`Eroare la procesarea actualizării locației: ${error.message}`);
      return { event: 'locationUpdateStatus', data: { success: false, error: error.message } };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribeToVehicle')
  handleSubscribeToVehicle(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { vehicleId: string },
  ): WsResponse<any> {
    try {
      const { tenantId } = client.data;
      const { vehicleId } = data;
      
      if (!tenantId || !vehicleId) {
        throw new Error('Tenant ID sau Vehicle ID lipsă');
      }
      
      // Adaugă clientul la camera specifică vehiculului, în contextul tenant-ului
      const roomName = `tenant:${tenantId}:vehicle:${vehicleId}`;
      client.join(roomName);
      
      this.logger.log(`Client ${client.id} abonat la vehiculul ${vehicleId} (tenant: ${tenantId})`);
      
      return { event: 'subscribeStatus', data: { success: true, vehicleId } };
    } catch (error) {
      this.logger.error(`Eroare la abonarea la vehicul: ${error.message}`);
      return { event: 'subscribeStatus', data: { success: false, error: error.message } };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribeFromVehicle')
  handleUnsubscribeFromVehicle(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { vehicleId: string },
  ): WsResponse<any> {
    try {
      const { tenantId } = client.data;
      const { vehicleId } = data;
      
      if (!tenantId || !vehicleId) {
        throw new Error('Tenant ID sau Vehicle ID lipsă');
      }
      
      // Scoate clientul din camera specifică vehiculului
      const roomName = `tenant:${tenantId}:vehicle:${vehicleId}`;
      client.leave(roomName);
      
      this.logger.log(`Client ${client.id} dezabonat de la vehiculul ${vehicleId} (tenant: ${tenantId})`);
      
      return { event: 'unsubscribeStatus', data: { success: true, vehicleId } };
    } catch (error) {
      this.logger.error(`Eroare la dezabonarea de la vehicul: ${error.message}`);
      return { event: 'unsubscribeStatus', data: { success: false, error: error.message } };
    }
  }
} 