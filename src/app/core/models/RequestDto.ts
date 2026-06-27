export interface RequestDto { 
    requestId :number;
    isActive?:boolean;
    UnitId:number;
    description:string;
    createdByUserId:number;
    photo:any;
    subSubjectId:number;
}