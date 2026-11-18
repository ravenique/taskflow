import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Transaction Runner Interface
 * Abstraction สำหรับ Drizzle Database Client ที่มีความสามารถในการเปิด transaction
 */
export interface TransactionRunner<TTx = unknown> {
	transaction<T>(txWork: (tx: TTx) => Promise<T>): Promise<T>;
}

/**
 * Transaction Context Storage
 * ใช้ AsyncLocalStorage จัดเก็บ Transaction Context (tx) ในแต่ละ Async Call Stack
 * ทำให้ Repository สามารถดึง tx ไปใช้งานได้โดยอัตโนมัติ โดยไม่ต้องรับเป็นพารามิเตอร์
 */
export const txStorage = new AsyncLocalStorage<unknown>();
