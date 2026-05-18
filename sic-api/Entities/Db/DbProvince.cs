using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using sic_api.Entities;

namespace sic_api.Entities.Db;

[Index(nameof(ProvinceCode), IsUnique = true)]
[Table("db_province")]
public class DbProvince : BaseEntity
{
    
    [Required]
    [ForeignKey(nameof(Country))]
    [Column("country_id")]
    public Guid CountryId { get; set; }
    public DbCountry Country { get; set; } = default!;
    
    [Required]
    [MaxLength(10)]
    [Column("province_code")]
    public string ProvinceCode { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("province_name_en")]
    public string ProvinceNameEn { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("province_name_local")]
    public string ProvinceNameLocal { get; set; } = default!;

    [Required]
    [Column("is_active")]
    public bool IsActive { get; set; } = false;

    public ICollection<DbDistrict>? Districts { get; set; }
}