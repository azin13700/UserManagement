export interface roleDto {
    description?: string;
    roleName?: string;
    roleId :number;
    createdAt:Date;
    isActive?:boolean;
    permissions:any

}