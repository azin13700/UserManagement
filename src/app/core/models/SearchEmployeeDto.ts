export interface SearchEmployeeDto {
  name?: string;

  family?: string;

  nationalCode?: string;

  companyName?: string;

  gender?: number | null;

  typeOfEmployment?: string;

  fromDate?: Date | null;

  toDate?: Date | null;
  }