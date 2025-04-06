import { _decorator, Component, Node, Color, EventTarget, Vec3, Sprite, UITransform, SpriteFrame, builtinResMgr } from 'cc';
import { Bean } from './Bean';

export const EventBus = new EventTarget();

export class Common {
    private static beansMap: (Node | null)[][] = [];

    static initBeansMap(rows: number, cols: number) {
        Common.beansMap = Array.from({ length: rows }, () => Array(cols).fill(null));
    }

    static getBeanAt(row: number, col: number): Node | null {
        return Common.beansMap[row]?.[col] ?? null;
    }

    static setBeanAt(row: number, col: number, bean: Node | null) {
        if (Common.beansMap[row]) {
            Common.beansMap[row][col] = bean;
        }
    }

    static rmBeanAt(row: number, col: number) {
        Common.beansMap[row][col] = null;
    }

    static clearBeansMap() {
        Common.beansMap = [];
    }

    static getMap() {
        return Common.beansMap;
    }
}