import { txStorage } from "./tx-context";

/**
 * Base Repository สำหรับ Drizzle ORM
 * มี getter `executor` คอยสลับระหว่าง `db` ปกติ กับ `tx` ใน Transaction Context อัตโนมัติ
 * ทำให้ Repository Method ไม่ต้องรับ `tx` ผ่านพารามิเตอร์ตามกฎข้อ 16 ใน server.md
 */
export abstract class DrizzleBaseRepository<TDb, TTx = TDb> {
	constructor(protected readonly db: TDb) {}

	protected get executor(): TDb | TTx {
		const tx = txStorage.getStore() as TTx | undefined;
		return tx ?? this.db;
	}
}
