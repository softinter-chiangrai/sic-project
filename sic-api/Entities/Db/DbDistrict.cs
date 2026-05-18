using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using sic_api.Entities;

namespace sic_api.Entities.Db;

[Index(nameof(DistrictCode), IsUnique = true)]
[Table("db_district")]
public class DbDistrict : BaseEntity
{
    
    [Required]
    [ForeignKey(nameof(Province))]
    [Column("province_id")]
    public Guid ProvinceId { get; set; }
    public DbProvince Province { get; set; } = default!;
    
    [Required]
    [MaxLength(10)]
    [Column("district_code")]
    public string DistrictCode { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("district_name_en")]
    public string DistrictNameEn { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("district_name_local")]
    public string DistrictNameLocal { get; set; } = default!;

    [Required]
    [Column("is_active")]
    public bool IsActive { get; set; } = false;

    public ICollection<DbSubDistrict>? SubDistricts { get; set; }
}