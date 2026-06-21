export interface PermissionDto {

    category: string;
    permissions:Permissions[];
  
  } 

  export interface Permissions{
    category:string;
    createdAt:string;
    description:string;
    id:string;
    isActive:boolean;
    name:string;
    roleCount:number;
  }