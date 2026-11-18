import { ValueObject } from "#/server/domain/common/value-object.base";
import { PROJECT_KEY_PATTERN } from "#/shared/schemas/project.schema";
import { InvalidProjectKeyError } from "./project.errors";

interface ProjectKeyProps {
	readonly value: string;
}

export class ProjectKey extends ValueObject<ProjectKeyProps> {
	private constructor(props: ProjectKeyProps) {
		super(props);
	}

	static create(rawKey: string): ProjectKey {
		const normalized = rawKey.trim().toUpperCase();
		if (!PROJECT_KEY_PATTERN.test(normalized)) {
			throw new InvalidProjectKeyError(rawKey);
		}
		return new ProjectKey({ value: normalized });
	}

	static reconstitute(value: string): ProjectKey {
		return new ProjectKey({ value });
	}

	get value(): string {
		return this.props.value;
	}
}
