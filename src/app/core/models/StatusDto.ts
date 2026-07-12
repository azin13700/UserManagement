

export interface StatusDto {
    stateId: number;
    stateName?: string;
    stateCaption?: string;
    isActive?: boolean;
    isAssigned?:boolean;
    isEnable?:boolean;
    unitId: number;
    userId: number;
    }