import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of } from 'rxjs';

import { CustomerModel } from './pmdt01.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Pmdt01Service {
  private readonly http = inject(HttpClient);

  // ===== Base URL =====
  // ถ้า backend ใช้ /api/customer ให้ใช้แบบนี้
  private apiCustomer = environment.apiBaseUrl + '/api/customer';

  // ถ้า backend ใช้ /api/business ร่วมกัน (เหมือน business-create) ให้เปลี่ยนเป็น apiBusiness
  // private apiBusiness = environment.apiBaseUrl + '/api/business';

  // ===== API Endpoints สำหรับ Combobox =====
  apiGetLovPersonType = this.apiCustomer + '/lov-person-type';
  apiGetComboboxTitle = this.apiCustomer + '/combobox-title';
  apiGetComboboxCountry = this.apiCustomer + '/combobox-country';
  apiGetComboboxProvince = this.apiCustomer + '/combobox-province';
  apiGetComboboxDistrict = this.apiCustomer + '/combobox-district';
  apiGetComboboxSubDistrict = this.apiCustomer + '/combobox-sub-district';

   private mockCustomers: CustomerModel[] = [
    {
      id: '1',
      personType: 'INDIVIDUAL',
      businessCode: 'CUS-001',
      taxId: '1-2345-67890-12-3',
      branchCode: '',
      titleId: '1',
      firstNameEn: 'สมชาย',
      middleNameEn: '',
      lastNameEn: 'ใจดี',
      firstNameLocal: 'สมชาย',
      middleNameLocal: '',
      lastNameLocal: 'ใจดี',
      countryId: '1',
      supportLocalAddress: true,
      addressEn: '123 Sukhumvit Rd, Bangkok',
      addressLocal: '123 ถนนสุขุมวิท กรุงเทพฯ',
      provinceId: '1',
      districtId: '1',
      subDistrictId: '1',
      zipCode: '10110',
      email: 'somchai@example.com',
      phoneNumber: '0812345678',
      uploadGroupId: '',
      uploadGroupData: [],
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
    {
      id: '2',
      personType: 'CORPORATE',
      businessCode: 'CUS-002',
      taxId: '2-3456-78901-23-4',
      branchCode: '001',
      titleId: '4',
      firstNameEn: 'บริษัท',
      middleNameEn: '',
      lastNameEn: 'ซอฟต์แวร์ จำกัด',
      firstNameLocal: 'บริษัท',
      middleNameLocal: '',
      lastNameLocal: 'ซอฟต์แวร์ จำกัด',
      countryId: '1',
      supportLocalAddress: true,
      addressEn: '456 Silom Rd, Bangkok',
      addressLocal: '456 ถนนสีลม กรุงเทพฯ',
      provinceId: '1',
      districtId: '2',
      subDistrictId: '2',
      zipCode: '10120',
      email: 'info@softflow.com',
      phoneNumber: '0834567890',
      uploadGroupId: '',
      uploadGroupData: [],
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  // ✅ save (Mock)
  save(customer: CustomerModel): Observable<string> {
    console.log('📝 Saving customer:', customer);
    return of('บันทึกสำเร็จ').pipe(delay(500));
    // จริงๆ ใช้ return this.http.post<string>(this.apiSaveCustomer, customer);
  }

  // ✅ getCustomer (Mock)
  getCustomer(id: string): Observable<CustomerModel> {
    const found = this.mockCustomers.find(c => c.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    // ถ้าไม่เจอ คืนค่าว่าง
    return of({
      id: '',
      personType: 'INDIVIDUAL',
      businessCode: '',
      taxId: '',
      branchCode: '',
      titleId: '',
      firstNameEn: '',
      middleNameEn: '',
      lastNameEn: '',
      firstNameLocal: '',
      middleNameLocal: '',
      lastNameLocal: '',
      countryId: '',
      supportLocalAddress: false,
      addressEn: '',
      addressLocal: '',
      provinceId: '',
      districtId: '',
      subDistrictId: '',
      zipCode: '',
      email: '',
      phoneNumber: '',
      uploadGroupId: '',
      uploadGroupData: [],
      isActive: true,
      state: 1,
      rowVersion: 0,
    }).pipe(delay(300));
  }

  // ===== API สำหรับบันทึก =====
  private apiSaveCustomer = this.apiCustomer + '/save';

  // ===== Methods =====

  // getCustomer(id: string): Observable<CustomerModel> {
  //   return this.http.get<CustomerModel>(`${this.apiCustomer}/${id}`);
  // }
}