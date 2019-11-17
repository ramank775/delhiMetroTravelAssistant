import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

declare const Graph: any, GraphVertex: any, GraphEdge: any, dijkstra: any;

export interface Item {
  name: string;
  description: string;
  url: string;
  html: string;
  markdown: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  stations;
  routes;
  graph;
  path = [];
 
  init() {
    return new Promise((resolve, reject) => {
      this.getRouteDetail().subscribe((route) => {
        this.routes = route;
        this.getStationDetail().subscribe((station) => {
          this.stations = station;
          this.buildGraph();
          resolve();
        })
      })
    });

  }

  private baseURL: string = "http://delhimetro.azurewebsites.net/api/";
  constructor(private httpClient: HttpClient) {

  }

  buildGraph() {
    this.graph = new Graph()
    for (let idx = 0; idx < this.stations.length; idx++) {
      const stn = this.stations[idx];
      this.graph.addVertex(new GraphVertex(stn.sId.toString()))
    }
    for (let idx = 0; idx < this.routes.length; idx++) {
      const route = this.routes[idx];
      const v1 = this.graph.getVertexByKey(route.fid.toString());
      const v2 = this.graph.getVertexByKey(route.lid.toString());
      this.graph.addEdge(new GraphEdge(v1, v2, (route.waiting + route.distance)));
    }
  }
 

  getRecommendedPath(src: string, dest: string) {
    this.path = [];
    const srcVertex = this.graph.getVertexByKey(src);
    const destVertex = this.graph.getVertexByKey(dest);
    const visitedVertexes = this.calcDistance(srcVertex);
    this.findTraversePath(visitedVertexes, destVertex);
    return this.path.map((vertex) => {
      return this.stations.find(s => s.sId.toString() == vertex.value);
    });
  }

  calcDistance(src) {
    const { distance, previousVertices } = dijkstra(this.graph, src);
    return previousVertices;
  }

  findTraversePath(visited, dest) {
    this.path.push(dest)
    let vertexKey = dest.getKey();
    let newVertex = visited[vertexKey];
    if (newVertex == null) {
      return this.path;
    }
    this.findTraversePath(visited, newVertex);
  }

  getStationDetail(): Observable<any[]> {
    return <Observable<any[]>>this.httpClient.get(this.baseURL + "getStationDetail");
  }

  getRouteDetail(): Observable<any[]> {
    return <Observable<any[]>>this.httpClient.get(this.baseURL + "getRouteDetail");
  }
  
}
