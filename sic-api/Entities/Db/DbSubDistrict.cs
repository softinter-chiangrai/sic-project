using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using sic_api.Entities;

namespace sic_api.Entities.Db;

[Index(nameof(SubDistrictCode), IsUnique = true)]
[Table("db_sub_district")]
public class DbSubDistrict : BaseEntity
{
    
    [Required]
    [ForeignKey(nameof(District))]
    [Column("district_id")]
    public Guid DistrictId { get; set; }
    public DbDistrict District { get; set; } = default!;

    [Required]
    [MaxLength(10)]
    [Column("sub_district_code")]
    public string SubDistrictCode { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("sub_district_name_en")]
    public string SubDistrictNameEn { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("sub_district_name_local")]
    public string SubDistrictNameLocal { get; set; } = default!;

    [Required]
    [MaxLength(20)]
    [Column("zip_code")]
    public string ZipCode { get; set; } = default!;

    [Column("latitude")]
    public long? Latitude { get; set; }
    
    [Column("longitude")]
    public long? Longitude { get; set; }

    [Required]
    [Column("is_active")]
    public bool IsActive { get; set; } = false;
}