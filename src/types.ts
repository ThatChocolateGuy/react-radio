// Primary station shape used across services/components
export type ServiceStation = {
  id: string;
  name: string;
  streamUrl: string;
  genre: string;
  favicon: string;
};

export interface RemoteStation {
  id?: string;
  stationuuid?: string;
  name?: string;
  stationname?: string;
  url?: string;
  url_resolved?: string;
  stream_url?: string;
  streamUrl?: string;
  tags?: string;
  genre?: string;
  favicon?: string;
  logo?: string;
}

export interface StaticStation {
  id?: string;
  name?: string;
  url?: string;
  genre?: string;
  country?: string;
}