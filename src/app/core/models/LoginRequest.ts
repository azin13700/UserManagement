export interface LoginRequest {
    userName: string;
    password: string;
  }

  export interface UserRole {
    roleId: number;
    roleName: string;
    roleDescription: string;
    permissions: string[];
  }
  
  export interface SelectRoleRequest {
    userId: number;
    roleId: number;
  }
  
  export interface SelectRoleResponse {
    userId: number;
    roleId: number;
    roleName: string;
    permissions: string[];
    token: string;
  }


  export interface LoginRole {
    roleId: number;
    roleName: string;
    description: string;
  }
  
  export interface LoginResponse {
    userId: number;
    username: string;
    fullName: string;
    email: string;
  
    roles: LoginRole[];
  
    permissions: string[];
  }