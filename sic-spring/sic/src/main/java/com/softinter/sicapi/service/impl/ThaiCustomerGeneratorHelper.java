package com.softinter.sicapi.service.impl;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Component;

import com.softinter.sicapi.entity.db.DbCountry;
import com.softinter.sicapi.entity.db.DbDistrict;
import com.softinter.sicapi.entity.db.DbProvince;
import com.softinter.sicapi.entity.db.DbSubDistrict;
import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.repository.db.DbCountryRepository;
import com.softinter.sicapi.repository.db.DbDistrictRepository;
import com.softinter.sicapi.repository.db.DbProvinceRepository;
import com.softinter.sicapi.repository.db.DbSubDistrictRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ผู้ช่วยสุ่มและเติมเต็มข้อมูลลูกค้าสัญชาติไทยแบบครบถ้วนทุกฟิลด์ (สถานที่ ที่อยู่ เบอร์โทร ผู้ติดต่อ เลขประจำตัวผู้เสียภาษี)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ThaiCustomerGeneratorHelper {

    private final PmCustomerRepository customerRepository;
    private final DbCountryRepository countryRepository;
    private final DbProvinceRepository provinceRepository;
    private final DbDistrictRepository districtRepository;
    private final DbSubDistrictRepository subDistrictRepository;

    private static final UUID THAILAND_ID = UUID.fromString("019e255b-4900-7001-b2de-4da92722fa88");

    private record ThaiCompanyTemplate(String local, String en) {}
    private record ThaiContactTemplate(String firstLocal, String lastLocal, String firstEn, String lastEn) {}
    private record ThaiStreetTemplate(String local, String en) {}

    private static final List<ThaiCompanyTemplate> DEFAULT_COMPANIES = List.of(
            new ThaiCompanyTemplate("บริษัท สยามนวัตกรรม ดิจิทัล จำกัด", "Siam Digital Innovation Co., Ltd."),
            new ThaiCompanyTemplate("บริษัท ไทยพัฒนา เทคโนโลยี แอนด์ ซิสเต็มส์ จำกัด", "Thai Pattana Technology & Systems Co., Ltd."),
            new ThaiCompanyTemplate("บริษัท บางกอก คลาวด์ โซลูชั่นส์ จำกัด", "Bangkok Cloud Solutions Co., Ltd."),
            new ThaiCompanyTemplate("บริษัท เจ้าพระยา ซอฟต์แวร์ อินฟินิตี้ จำกัด", "Chaophraya Software Infinity Co., Ltd."),
            new ThaiCompanyTemplate("บริษัท อันดามัน ดิจิทัล เน็ตเวิร์ก จำกัด", "Andaman Digital Network Co., Ltd."),
            new ThaiCompanyTemplate("บริษัท สยาม อินเทลลิเจนซ์ กรุ๊ป จำกัด", "Siam Intelligence Group Co., Ltd."),
            new ThaiCompanyTemplate("บริษัท ไทยแลนด์ เอนเตอร์ไพรส์ เทคโนโลยี จำกัด", "Thailand Enterprise Technology Co., Ltd."),
            new ThaiCompanyTemplate("บริษัท สยาม เมโทร คอร์ปอเรชั่น จำกัด", "Siam Metro Corporation Co., Ltd."),
            new ThaiCompanyTemplate("บริษัท ก้าวหน้า นวัตกรรม ดิจิทัล จำกัด", "Kao Na Digital Innovation Co., Ltd."),
            new ThaiCompanyTemplate("บริษัท ล้านนา เทค แอนด์ คอนซัลติ้ง จำกัด", "Lanna Tech & Consulting Co., Ltd.")
    );

    private static final List<ThaiContactTemplate> DEFAULT_CONTACTS = List.of(
            new ThaiContactTemplate("สมชาย", "วิจิตรศิลป์", "Somchai", "Vijitsilp"),
            new ThaiContactTemplate("กิตติศักดิ์", "พงศ์ไพโรจน์", "Kittisak", "Pongpairoj"),
            new ThaiContactTemplate("วิภาวรรณ", "เจริญสุข", "Wipawan", "Charoensuk"),
            new ThaiContactTemplate("ธนกร", "รัตนสัจจา", "Thanakorn", "Rattanasajja"),
            new ThaiContactTemplate("นพดล", "เกียรติไพบูลย์", "Noppadol", "Kiatpaiboon"),
            new ThaiContactTemplate("ชัญญา", "ศรีสวัสดิ์", "Chanya", "Srisawat"),
            new ThaiContactTemplate("ประวิทย์", "วงศ์สว่าง", "Prawit", "Wongsawang"),
            new ThaiContactTemplate("ศศิธร", "มงคลกุล", "Sasithorn", "Mongkolkul"),
            new ThaiContactTemplate("อนุชา", "ประเสริฐยิ่ง", "Anucha", "Prasertying"),
            new ThaiContactTemplate("พิมลพรรณ", "สุขสมบูรณ์", "Pimonpan", "Suksomboon")
    );

    private static final List<ThaiStreetTemplate> DEFAULT_STREETS = List.of(
            new ThaiStreetTemplate("88/12 อาคารสยามทาวเวอร์ ชั้น 18 ถนนสุขุมวิท 21", "88/12 Siam Tower, 18th Floor, Sukhumvit 21 Road"),
            new ThaiStreetTemplate("123 อาคารซีทีไอ ทาวเวอร์ ชั้น 20 ถนนรัชดาภิเษก", "123 CTI Tower, 20th Floor, Ratchadaphisek Road"),
            new ThaiStreetTemplate("555/19 อาคารพหลโยธินเพลส ชั้น 14 ถนนพหลโยธิน", "555/19 Phaholyothin Place, 14th Floor, Phaholyothin Road"),
            new ThaiStreetTemplate("999/9 อาคารดิ ออฟฟิศเซส แอท เซ็นทรัลเวิลด์ ชั้น 25 ถนนพระราม 1", "999/9 The Offices at CentralWorld, 25th Floor, Rama 1 Road"),
            new ThaiStreetTemplate("191 อาคารสีลมคอมเพล็กซ์ ชั้น 16 ถนนสีลม", "191 Silom Complex, 16th Floor, Silom Road"),
            new ThaiStreetTemplate("63 อาคารแอทธินี ทาวเวอร์ ชั้น 22 ถนนวิทยุ", "63 Athenee Tower, 22nd Floor, Wireless Road"),
            new ThaiStreetTemplate("77/1 อาคารสาธรซิตี้ทาวเวอร์ ชั้น 18 ถนนสาทรใต้", "77/1 Sathorn City Tower, 18th Floor, South Sathorn Road"),
            new ThaiStreetTemplate("252/12 อาคารเมืองไทย-ภัทร คอมเพล็กซ์ ชั้น 15 ถนนรัชดาภิเษก", "252/12 Muang Thai-Phatra Complex, 15th Floor, Ratchadaphisek Road")
    );

    /**
     * สร้างและบันทึกลูกค้าสัญชาติไทยรายใหม่พร้อมข้อมูลครบถ้วนทุกฟิลด์
     */
    public PmCustomer createAndSaveFullThaiCustomer(UUID businessId, String companyNameLocal, String companyNameEn, String contactPerson) {
        PmCustomer customer = new PmCustomer();
        customer.setBusinessId(businessId);
        populateFullThaiCustomer(customer, companyNameLocal, companyNameEn, contactPerson);
        PmCustomer saved = customerRepository.save(customer);
        log.info("Successfully created full Thai customer '{}' ({}) with address in Thailand", saved.getCompanyNameLocal(), saved.getCustomerCode());
        return saved;
    }

    /**
     * เติมข้อมูลให้ครบทุกฟิลด์สำหรับ PmCustomer ที่มีอยู่แล้วหรือสร้างใหม่
     */
    public void populateFullThaiCustomer(PmCustomer customer, String preferredLocalName, String preferredEnName, String preferredContact) {
        ThreadLocalRandom rnd = ThreadLocalRandom.current();

        // 1. Customer Code
        if (customer.getCustomerCode() == null || customer.getCustomerCode().isBlank()) {
            customer.setCustomerCode("CUST-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + String.format("%03d", rnd.nextInt(100, 1000)));
        }

        // 2. Person Type
        customer.setPersonType("CORPORATE");

        // 3. Company Names
        ThaiCompanyTemplate fallbackCompany = DEFAULT_COMPANIES.get(rnd.nextInt(DEFAULT_COMPANIES.size()));
        String localName = sanitizeCompanyNameLocal(preferredLocalName, fallbackCompany.local());
        String enName = sanitizeCompanyNameEn(preferredEnName, localName, fallbackCompany.en());
        customer.setCompanyNameLocal(localName);
        customer.setCompanyNameEn(enName);

        // 4. Tax ID (เลขประจำตัวผู้เสียภาษี 13 หลักสำหรับนิติบุคคลไทย ขึ้นต้นด้วย 01055)
        if (customer.getTaxId() == null || customer.getTaxId().isBlank()) {
            customer.setTaxId("01055" + String.format("%08d", rnd.nextInt(10000000, 99999999)));
        }

        // 5. Branch Code (สำนักงานใหญ่)
        if (customer.getBranchCode() == null || customer.getBranchCode().isBlank()) {
            customer.setBranchCode("00000");
        }

        // 6. Contact Person & Names
        ThaiContactTemplate contactTpl = DEFAULT_CONTACTS.get(rnd.nextInt(DEFAULT_CONTACTS.size()));
        if (preferredContact != null && !preferredContact.isBlank() && !preferredContact.equals("null")) {
            customer.setContactPerson(preferredContact.trim());
            String cleaned = preferredContact.replace("คุณ", "").replace("นาย", "").replace("นางสาว", "").replace("นาง", "").trim();
            String[] parts = cleaned.split("\\s+");
            customer.setFirstNameLocal(parts.length > 0 ? parts[0] : contactTpl.firstLocal());
            customer.setLastNameLocal(parts.length > 1 ? parts[1] : contactTpl.lastLocal());
            customer.setFirstNameEn(contactTpl.firstEn());
            customer.setLastNameEn(contactTpl.lastEn());
        } else {
            customer.setContactPerson("คุณ" + contactTpl.firstLocal() + " " + contactTpl.lastLocal());
            customer.setFirstNameLocal(contactTpl.firstLocal());
            customer.setLastNameLocal(contactTpl.lastLocal());
            customer.setFirstNameEn(contactTpl.firstEn());
            customer.setLastNameEn(contactTpl.lastEn());
        }

        // 7. Phone Number & Line ID & Email
        if (customer.getPhoneNumber() == null || customer.getPhoneNumber().isBlank()) {
            customer.setPhoneNumber("02-" + rnd.nextInt(200, 999) + "-" + String.format("%04d", rnd.nextInt(1000, 9999)));
        }

        String slug = toSlug(enName);
        if (slug.isBlank() || slug.length() < 3) slug = "siamtech";
        if (customer.getEmail() == null || customer.getEmail().isBlank()) {
            customer.setEmail("contact@" + slug + ".co.th");
        }
        if (customer.getLineId() == null || customer.getLineId().isBlank()) {
            customer.setLineId("@" + slug);
        }

        // 8. Thai Geography & Address
        populateThaiGeographyAndAddress(customer, rnd);

        // 9. Status & Meta
        customer.setSupportLocalAddress(true);
        customer.setIsActive(true);
        if (customer.getRemark() == null || customer.getRemark().isBlank()) {
            customer.setRemark("ข้อมูลลูกค้าที่สร้างขึ้นโดยระบบอัตโนมัติ AI (สถานที่ตั้งและที่อยู่จริงในประเทศไทย)");
        }
    }

    /**
     * ดึงข้อมูลจังหวัด/อำเภอ/ตำบลในประเทศไทยจากฐานข้อมูล พร้อมผูก Foreign Key และประกอบที่อยู่ไทย-อังกฤษ
     */
    private void populateThaiGeographyAndAddress(PmCustomer customer, ThreadLocalRandom rnd) {
        DbCountry thailand = countryRepository.findById(THAILAND_ID)
                .or(() -> countryRepository.findByCountryCodeIgnoreCase("TH"))
                .orElse(null);

        DbProvince chosenProvince = null;
        DbDistrict chosenDistrict = null;
        DbSubDistrict chosenSubDistrict = null;

        if (thailand != null) {
            customer.setCountry(thailand);
            List<DbProvince> provinces = provinceRepository.findByCountryIdAndIsActiveTrueOrderByName(thailand.getId(), false);
            if (!provinces.isEmpty()) {
                // เน้นกรุงเทพมหานครหรือสุ่มจากจังหวัดหลัก
                chosenProvince = provinces.stream()
                        .filter(p -> p.getProvinceNameLocal() != null && p.getProvinceNameLocal().contains("กรุงเทพ"))
                        .findFirst()
                        .orElse(provinces.get(rnd.nextInt(provinces.size())));

                List<DbDistrict> districts = districtRepository.findByProvinceIdAndIsActiveTrueOrderByName(chosenProvince.getId(), false);
                if (!districts.isEmpty()) {
                    chosenDistrict = districts.get(rnd.nextInt(districts.size()));
                    List<DbSubDistrict> subDistricts = subDistrictRepository.findByDistrictIdAndIsActiveTrueOrderByName(chosenDistrict.getId(), false);
                    if (!subDistricts.isEmpty()) {
                        chosenSubDistrict = subDistricts.get(rnd.nextInt(subDistricts.size()));
                    }
                }
            }
        }

        ThaiStreetTemplate street = DEFAULT_STREETS.get(rnd.nextInt(DEFAULT_STREETS.size()));
        if (chosenSubDistrict != null && chosenDistrict != null && chosenProvince != null) {
            customer.setProvince(chosenProvince);
            customer.setDistrict(chosenDistrict);
            customer.setSubDistrict(chosenSubDistrict);
            String zip = chosenSubDistrict.getZipCode() != null ? chosenSubDistrict.getZipCode() : "10110";
            customer.setZipCode(zip);

            String localAddr = street.local()
                    + " แขวง/ตำบล" + chosenSubDistrict.getSubDistrictNameLocal()
                    + " เขต/อำเภอ" + chosenDistrict.getDistrictNameLocal()
                    + " จังหวัด" + chosenProvince.getProvinceNameLocal()
                    + " " + zip;
            String enAddr = street.en()
                    + ", " + chosenSubDistrict.getSubDistrictNameEn()
                    + ", " + chosenDistrict.getDistrictNameEn()
                    + ", " + chosenProvince.getProvinceNameEn()
                    + " " + zip + ", Thailand";

            customer.setAddressLocal(localAddr);
            customer.setAddressEn(enAddr);
        } else {
            // Fallback กรณี DB ยังไม่มี Master Geodata
            customer.setZipCode("10110");
            customer.setAddressLocal(street.local() + " แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพมหานคร 10110");
            customer.setAddressEn(street.en() + ", Khlong Toei Nuea, Watthana, Bangkok 10110, Thailand");
        }
    }

    /**
     * เติมข้อมูลให้ลูกค้าที่มีอยู่แล้วหากพบว่าฟิลด์สำคัญยังว่างอยู่
     */
    public void enrichCustomerIfIncomplete(PmCustomer customer) {
        if (customer == null) return;
        boolean needsEnrich = customer.getAddressLocal() == null || customer.getAddressLocal().isBlank()
                || customer.getTaxId() == null || customer.getTaxId().isBlank()
                || customer.getPhoneNumber() == null || customer.getPhoneNumber().isBlank();
        if (needsEnrich) {
            populateFullThaiCustomer(customer, customer.getCompanyNameLocal(), customer.getCompanyNameEn(), customer.getContactPerson());
            customerRepository.save(customer);
            log.info("Enriched existing customer '{}' with full Thai contact & address info", customer.getCustomerCode());
        }
    }

    private String sanitizeCompanyNameLocal(String preferred, String fallback) {
        if (preferred == null || preferred.isBlank() || preferred.contains("ลูกค้าทั่วไป") || preferred.equals("null")) {
            return fallback;
        }
        String s = preferred.trim();
        if (!s.startsWith("บริษัท") && !s.startsWith("ห้างหุ้นส่วน")) {
            s = "บริษัท " + s;
        }
        if (!s.contains("จำกัด") && !s.contains("มหาชน")) {
            s = s + " จำกัด";
        }
        return s;
    }

    private String sanitizeCompanyNameEn(String preferredEn, String localName, String fallback) {
        if (preferredEn != null && !preferredEn.isBlank() && !preferredEn.contains("General Client") && !preferredEn.equals("null")) {
            String s = preferredEn.trim();
            if (!s.toLowerCase(Locale.ROOT).contains("co.") && !s.toLowerCase(Locale.ROOT).contains("ltd") && !s.toLowerCase(Locale.ROOT).contains("corp")) {
                s = s + " Co., Ltd.";
            }
            return s;
        }
        return fallback;
    }

    private String toSlug(String text) {
        if (text == null) return "";
        return text.replaceAll("(?i)\\b(co|ltd|company|limited|corp|corporation)\\b", "")
                .replaceAll("[^a-zA-Z0-9]", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }
}
