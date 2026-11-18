import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import type { TransactionRunner } from "./tx-context";
import { txStorage } from "./tx-context";

export class DrizzleUnitOfWork<TTx = unknown> implements IUnitOfWork {
	constructor(private readonly db: TransactionRunner<TTx>) {}

	async withTransaction<T>(work: () => Promise<T>): Promise<T> {
		const existingTx = txStorage.getStore();
		if (existingTx) {
			return work();
		}

		return this.db.transaction(async (tx) => {
			return txStorage.run(tx, work);
		});
	}
}
