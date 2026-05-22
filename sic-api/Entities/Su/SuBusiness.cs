using sic_api.Attributes;
using sic_api.Entities.Db;
using sic_api.Model.Storage;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sic_api.Entities.Su;

[Table("su_business")]
public class SuBusiness : BaseEntity
{

    [MaxLength(30)]
    [Column("tax_id")]
    public string? TaxId { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("business_code")]
    public string BusinessCode { get; set; } = default!;

    [MaxLength(30)]
    [Column("branch_code")]
    public string? BranchCode { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("person_type")]
    public string PersonType { get; set; } = default!;

    [Required]
    [ForeignKey(nameof(Title))]
    [Column("title_id")]
    public Guid TitleId { get; set; }
    public DbTitle Title { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("first_name_en")]
    public string FirstNameEn { get; set; } = default!;

    [MaxLength(100)]
    [Column("middle_name_en")]
    public string? MiddleNameEn { get; set; }

    [MaxLength(100)]
    [Column("last_name_en")]
    public string? LastNameEn { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("first_name_local")]
    public string FirstNameLocal { get; set; } = default!;

    [MaxLength(100)]
    [Column("middle_name_local")]
    public string? MiddleNameLocal { get; set; }

    [MaxLength(100)]
    [Column("last_name_local")]
    public string? LastNameLocal { get; set; }

    [Required]
    [ForeignKey(nameof(Country))]
    [Column("country_id")]
    public Guid CountryId { get; set; }
    public DbCountry Country { get; set; } = default!;

    [Required]
    [Column("support_local_address")]
    public bool SupportLocalAddress { get; set; } = false;
    
    [MaxLength(255)]
    [Column("address_en")]
    public string? AddressEn { get; set; }

    [MaxLength(255)]
    [Column("address_local")]
    public string? AddressLocal { get; set; }

    [ForeignKey(nameof(Province))]
    [Column("province_id")]
    public Guid? ProvinceId { get; set; }
    public DbProvince? Province { get; set; }

    [ForeignKey(nameof(District))]
    [Column("district_id")]
    public Guid? DistrictId { get; set; }
    public DbDistrict? District { get; set; }

    [ForeignKey(nameof(SubDistrict))]
    [Column("sub_district_id")]
    public Guid? SubDistrictId { get; set; }
    public DbSubDistrict? SubDistrict { get; set; }

    [MaxLength(20)]
    [Column("zip_code")]
    public string? ZipCode { get; set; }

    [MaxLength(320)]
    [Column("email")]
    public string? Email { get; set; }
    
    [MaxLength(20)]
    [Column("phone_number")]
    public string? PhoneNumber { get; set; }

    [MaxLength(20)]
    [Column("fax")]
    public string? Fax { get; set; }

    [Column("upload_group_id")]
    public Guid? UploadGroupId { get; set; }

    [Required]
    [Column("is_active")]
    public bool IsActive { get; set; } = false;

    public ICollection<SuUserBusiness>? UserBusinesses { get; set; }
    public ICollection<SuBusinessRole>? BusinessRoles { get; set; }
    public ICollection<SuBusinessAudit>? BusinessAudits { get; set; }
}
