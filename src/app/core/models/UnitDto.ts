export interface UnitDto {
    unitId: number;

    name: string;

    description?: string;

    parentId?: number | null;

    parentName?: string | null;

    isActive?: boolean;

    userCount?: number;

    childrenCount?: number;

    createdAt?: string | null;

}