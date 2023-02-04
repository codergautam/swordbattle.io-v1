interface IEntity {
    id: number;
}

interface IEntityManager<T> {
    add(entity: T): void;
    remove(entity: T): void;
    removeById(id: number): void;
}

export default class ObjectManager<T extends IEntity> implements IEntityManager<T> {
    readonly array: T[];
    private readonly link: Map<number, number>;

    constructor() {
        this.array = [];
        this.link = new Map<number, number>();
    }
    /**
     *
     * @param entity
     * Add an entity to the manager
     */
    add(entity: T): void {
        const index = this.array.length;
        this.array.push(entity);
        this.link.set(entity.id, index);
    }
    /**
     *
     * @param entity
     * Remove an entity from the manager given the entity object
     */
    remove(entity: T): void {
        if (entity.id === -1) throw new Error("Trying to remove an entity that doesn't exist");

        const index = this.link.get(entity.id);
        const lastIndex = this.array.length - 1;

        if (index !== lastIndex) {
            const lastEntity = this.array[lastIndex];
            this.array[lastIndex] = entity;
            this.array[index!] = lastEntity;
            this.link.set(lastEntity.id, index!);
        }

        this.array.pop();

        this.link.delete(entity.id);
    }
    /**
     *
     * @param id
     * Remove an entity from the manager given the entity id
     */
    removeById(id: number): void {
        const index = this.link.get(id) as number;
        const entity = this.array[index];
        this.remove(entity);
    }
    /**
     *
     * @param id
     * @returns Entity that has the given id
     */
    get(id: number): T {
        const index = this.link.get(id) as number;
        return this.array[index];
    }
}
