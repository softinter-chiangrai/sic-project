using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using sic_api.Entities;

namespace sic_api.Entities.Db;

[Index(nameof(CountryCode), IsUnique = true)]
[Index(nameof(IsoCode), IsUnique = true)]
[Table("db_country")]
public class DbCountry : BaseEntity
{
    
    [Required]
    [MaxLength(10)]
    [Column("country_code")]
    public string CountryCode { get; set; } = default!;
    
    [Required]
    [MaxLength(10)]
    [Column("iso_code")]
    public string IsoCode { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("country_name_en")]
    public string CountryNameEn { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("country_name_local")]
    public string CountryNameLocal { get; set; } = default!;

    [Required]
    [Column("support_local_address")]
    public bool SupportLocalAddress { get; set; } = false;

    [Required]
    [Column("is_active")]
    public bool IsActive { get; set; } = false;

    public ICollection<DbProvince>? Provinces { get; set; }
}