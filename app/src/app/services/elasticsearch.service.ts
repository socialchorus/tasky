import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";

export interface IClientSettings {
  host: string;
  auth?: {
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyId?: string;
  };
}

@Injectable({
  providedIn: "root"
})
export class ElasticsearchService {
  private client: IClientSettings;
  private host$: BehaviorSubject<IClientSettings> = new BehaviorSubject(
    {} as IClientSettings
  );

  constructor(private http: HttpClient) {}

  public hasHost() {
    return this.host && this.host.length;
  }

  private get host() {
    if (!this.client) {
      return undefined;
    }
    return this.client.host.endsWith("/")
      ? this.client.host.slice(0, -1)
      : this.client.host;
  }

  private constructBasicAuthHeader() {
    if (!this.client.auth.username || !this.client.auth.password) {
      return {};
    }

    const b64token = btoa(
      `${this.client.auth.username}:${this.client.auth.password}`
    );
    return {
      Authorization: `Basic ${b64token}`
    };
  }

  private constructApiKeyHeader() {
    if (!this.client.auth.apiKey || !this.client.auth.apiKeyId) {
      return {};
    }

    const b64token = btoa(
      `${this.client.auth.apiKeyId}:${this.client.auth.apiKey}`
    );
    return {
      Authorization: `ApiKey ${b64token}`
    };
  }

  private getCommonHeaders() {
    return new HttpHeaders({
      ...this.constructBasicAuthHeader(),
      ...this.constructApiKeyHeader()
    });
  }

  initClient(opts: IClientSettings) {
    this.client = {
      host: opts.host,
      ...(!opts.auth
        ? {}
        : {
            auth: opts.auth.apiKey
              ? { apiKey: opts.auth.apiKey }
              : { username: opts.auth.username, password: opts.auth.password }
          })
    };

    this.host$.next(this.client);
  }

  async ping() {
    return this.http
      .get(`${this.host}`, { headers: this.getCommonHeaders() })
      .toPromise();
  }

  async fetchTasks(group_by: "nodes" | "parents" | "none" = "none") {
    this.http
      .get(`${this.host}/_tasks?human&detailed&group_by=${group_by}`, {
        headers: this.getCommonHeaders()
      })
      .toPromise();
  }
}
