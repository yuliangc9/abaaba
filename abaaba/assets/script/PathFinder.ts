import { _decorator, Component, Node, Vec3 } from 'cc';
import { BeanManager } from './BeanManager';

type GridNode = {
  x: number;
  y: number;
  walkable: boolean;
  parent?: GridNode;
  g: number;
  h: number;
  f: number;
};

export class PathFinder {
  private static _instance: PathFinder;
  private beanManager: BeanManager;
  private gridSize = 9;

  public static get instance(): PathFinder {
    if (!this._instance) {
      this._instance = new PathFinder();
    }
    return this._instance;
  }

  public initialize(beanManager: BeanManager) {
    this.beanManager = beanManager;
  }

  public findPath(start: Vec3, end: Vec3): Vec3[] {
    const startNode = this.convertToGridNode(start);
    const endNode = this.convertToGridNode(end);
    const openList: GridNode[] = [];
    const closedList: GridNode[] = [];

    openList.push(startNode);

    while (openList.length > 0) {
      let currentNode = openList[0];
      let currentIndex = 0;

      openList.forEach((node, index) => {
        if (node.f < currentNode.f) {
          currentNode = node;
          currentIndex = index;
        }
      });

      openList.splice(currentIndex, 1);
      closedList.push(currentNode);

      if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
        return this.retracePath(startNode, currentNode);
      }

      const neighbors = this.getNeighbors(currentNode);
      neighbors.forEach(neighbor => {
        if (!neighbor.walkable || closedList.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
          return;
        }

        const newCostToNeighbor = currentNode.g + 1;
        if (newCostToNeighbor < neighbor.g || !openList.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
          neighbor.g = newCostToNeighbor;
          neighbor.h = this.getDistance(neighbor, endNode);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = currentNode;

          if (!openList.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
            openList.push(neighbor);
          }
        }
      });
    }

    return [];
  }

  private convertToGridNode(pos: Vec3): GridNode {
    const beanPositions = this.beanManager.getBeanPositions();
    const isOccupied = beanPositions.some(p => 
      Math.floor(p.x) === Math.floor(pos.x) && 
      Math.floor(p.y) === Math.floor(pos.y)
    );

    return {
      x: Math.floor(pos.x),
      y: Math.floor(pos.y),
      walkable: !isOccupied,
      g: 0,
      h: 0,
      f: 0
    };
  }

  private getNeighbors(node: GridNode): GridNode[] {
    const neighbors: GridNode[] = [];
    const directions = [
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: -1, y: 0 }
    ];

    directions.forEach(dir => {
      const newX = node.x + dir.x;
      const newY = node.y + dir.y;

      if (newX >= 0 && newX < this.gridSize && newY >= 0 && newY < this.gridSize) {
        neighbors.push(this.convertToGridNode(new Vec3(newX, newY, 0)));
      }
    });

    return neighbors;
  }

  private getDistance(nodeA: GridNode, nodeB: GridNode): number {
    return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
  }

  private retracePath(startNode: GridNode, endNode: GridNode): Vec3[] {
    const path: Vec3[] = [];
    let currentNode: GridNode | undefined = endNode;

    while (currentNode && (currentNode.x !== startNode.x || currentNode.y !== startNode.y)) {
      path.push(new Vec3(currentNode.x, currentNode.y, 0));
      currentNode = currentNode.parent;
    }

    return path.reverse();
  }
}