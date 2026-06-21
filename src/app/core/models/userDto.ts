export interface userDto {
    UserName?: string;
    FullName?: string;
     UserId :number;
     Photo:any;
     Role:string[];
     Email:string;
     Status:string;
     createdAt:Date;
     isActive?:boolean;
     unitId:number;

}