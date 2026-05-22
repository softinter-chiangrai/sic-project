using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using sic_api.Attributes;
using sic_api.Entities;
using sic_api.Entities.Db;
using sic_api.Model.Storage;

namespace sic_api.Entities.Su;


[Index(nameof(UserId), IsUnique = true)]
[Table("su_profile")]
public class SuProfile : BaseEntity
{
    [Required]
    [MaxLength(100)]
    [Column("user_id")]
    public string UserId { get; set; } = default!;

    [MaxLength(30)]
    [Column("tax_id")]
    public string? TaxId { get; set; }

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

    [ForeignKey(nameof(Country))]
    [Column("country_id")]
    public Guid? CountryId { get; set; }
    public DbCountry? Country { get; set; }

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

    [Required]
    [MaxLength(320)]
    [Column("email")]
    public string Email { get; set; } = default!;
    
    [MaxLength(20)]
    [Column("phone_number")]
    public string? PhoneNumber { get; set; }

    [Column("upload_group_id")]
    public Guid? UploadGroupId { get; set; }
}