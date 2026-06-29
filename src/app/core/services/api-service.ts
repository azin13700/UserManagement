import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PermissionDto } from '../models/PermissionDto';
import { LoginRequest, LoginResponse, SelectRoleRequest, SelectRoleResponse } from '../models/LoginRequest';
import { UnitDto } from '../models/UnitDto';
import { RequestWorkFlowDto } from '../models/RequestWorkFlowDto';

@Injectable({
  providedIn: 'root',
})
export class ApiService {


  readonly apiUrl = 'https://localhost:7178/api/';

  constructor(private http: HttpClient) { }
  GetAllUsers():Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'user/GetAllUsers' );
  }

  GetAllRoles():Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'Role/GetAllRoles' );
  }

  CreateEmployee(formData: FormData) {
    return this.http.post<any>(this.apiUrl + 'user/CreateUsere', formData);
  }
  
  GetUserById(userId:any):Observable<any> {

    return this.http.get<any>(this.apiUrl + 'User/GetUserById/' +userId   );
  }

 UpdateUser(id: number, formData: FormData): Observable<any> {
  return this.http.put(this.apiUrl + `User/Update/${id}`, formData);
}

DeleteUser(id: number): Observable<any> {
  return this.http.delete(this.apiUrl + `User/Delete/${id}`);
}





GetAllUnits(): Observable<any[]> {
  return this.http.get<any[]>(this.apiUrl + 'Unit/GetAllUnits');
}





getUnitById(id: number): Observable<any> {
  return this.http.get<any>(this.apiUrl + `Unit/GetUnitById/${id}`);
}


createRole(data: any): Observable<any> {
  return this.http.post(this.apiUrl + 'Role/Create', data);
}

updateRole(id: number, data: any): Observable<any> {
  return this.http.put(this.apiUrl + `Role/Update/${id}`, data);
}
deleteUnit(id: number): Observable<any> {
  return this.http.delete(this.apiUrl + `Unit/Delete/${id}`);
}
GetRoleById(id: number): Observable<any> {
  return this.http.get<any>(this.apiUrl + `Role/getrolebyid/${id}`);
}
UpdateUserStatus(userId: number, newStatus: string) {
  return this.http.get<any[]>(this.apiUrl + 'Role/GetAllRoles' );
}

SearchEmployee(dto: any): Observable<any> {
  return this.http.post(`${this.apiUrl}user/Search`, dto);
}
ToggleEmployeeStatus(data:any): Observable<any> {
  var headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
  return this.http.post(this.apiUrl + 'user/ChangeStatus', JSON.stringify(data) , {headers: headers});

}
getRolePermissions(roleId: number) {
  return this.http.get<any>(this.apiUrl + `Permission/GetPermissionsByRoleId/${roleId}`);
}
ToggleRoleStatus(data: any): Observable<any> {
  var headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
  return this.http.post(this.apiUrl + 'Role/ChangeStatus', JSON.stringify(data) , {headers: headers});
}

// ToggleUnitStatus(data: any) {
//   var headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
//   return this.http.post(this.apiUrl + 'unit/ChangeStatus', JSON.stringify(data) , {headers: headers});
// }



  getAllPermissions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}Permission/GetAll`);
  }

  getPermissionById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}Permission/GetById/${id}`);
  }



  createPermission(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Permission/Create`, data);
  }



  updatePermission(data: any): Observable<any> {
    const payload = {
      id: data.id,
      name: data.name,
      category: data.category,
      description: data.description || '',
      isActive: data.isActive
    };
    return this.http.put(`${this.apiUrl}Permission/Update`, payload);
  }

  deletePermission(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}Permission/Delete/${id}`);
  }


AssignPermissionsToRole(roleId: number, permissionIds: number[]){
  return this.http.post(this.apiUrl + `Permission/AssignPermissions`, { roleId, permissionIds });
}

  
  getAllRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}Role/GetAll`);
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}Auth/Login`, credentials);
  }

  selectRole(data: SelectRoleRequest): Observable<SelectRoleResponse> {
    return this.http.post<SelectRoleResponse>(`${this.apiUrl}Auth/SelectRole`, data);
  }
  GetAllSubject(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'Subject');
  }

  getAllSubjects(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}Subject/GetAll`);
}

getSubjectById(id: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}Subject/${id}`);
}

createSubject(formData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}Subject`, formData);
}


updateSubject(id: number, formData: FormData): Observable<any> {
  return this.http.put(this.apiUrl + `Subject/${id}`, formData);
}


getChildren(parentId: number): Observable<any[]> {
  return this.http.get<any[]>(this.apiUrl + `Subject/${parentId}/children`);
}

GetSubSubjects(subjectId: number) {
  return this.http.get<any[]>(
    `${this.apiUrl}subject/${subjectId}/subsubjects`
  );
}
CreateRequest(formData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}request`, formData);
}
ToggleSubjectStatus(data: any) {
  var headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
  return this.http.post(this.apiUrl + 'subject/ChangeStatus', JSON.stringify(data) , {headers: headers});
}
getWorkFlow(id: number): Observable<RequestWorkFlowDto[]> {
  return this.http.get<RequestWorkFlowDto[]>(
    `${this.apiUrl}Request/work-flow/${id}`
  );
}
ToggleUnitStatus(unitId: number): Observable<any> {
  return this.http.patch(`${this.apiUrl}Unit/ToggleStatus/${unitId}`, {});
}

SearchRequest(dto: any): Observable<any> {
  return this.http.post(`${this.apiUrl}request/Search`, dto);
}

createUnit(formData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}Unit/Create`, formData);
}

updateUnit(id: number, formData: FormData): Observable<any> {
  return this.http.put(`${this.apiUrl}Unit/Update/${id}`, formData);
}
}
