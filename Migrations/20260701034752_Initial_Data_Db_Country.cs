using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class Initial_Data_Db_Country : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "db_country",
                columns: new[] { "id", "country_code", "iso_code", "country_name_en", "country_name_local", "support_local_address", "is_active", "created_by", "created_date", "updated_by", "updated_date", "is_delete", "delete_by", "delete_date" },
                values: new object[,]
                {
                    // --- ASIA ---
            { new Guid("019e255b-4900-7001-b2de-4da92722fa88"), "TH", "THA", "Thailand", "ไทย", true, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4901-7002-9c96-02f62e39138c"), "AF", "AFG", "Afghanistan", "อัฟกานิสถาน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4902-7003-b5e5-353a06c1f7d8"), "AM", "ARM", "Armenia", "อาร์เมเนีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4903-7004-be36-3bfd37f1c9e8"), "AZ", "AZE", "Azerbaijan", "อาเซอร์ไบจาน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4904-7005-a640-70fccc8533b3"), "BH", "BHR", "Bahrain", "บาห์เรน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4905-7006-92ae-74528eadab6c"), "BD", "BGD", "Bangladesh", "บังกลาเทศ", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4906-7007-a952-f50b539a1dfd"), "BT", "BTN", "Bhutan", "ภูฏาน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4907-7008-a8d1-624e66cdc3b4"), "BN", "BRN", "Brunei", "บรูไน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4908-7009-b1f1-fa312be5a59b"), "KH", "KHM", "Cambodia", "กัมพูชา", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4909-700a-bd3a-810baa80d235"), "CN", "CHN", "China", "จีน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-490a-700b-a411-485d731e0d0a"), "GE", "GEO", "Georgia", "จอร์เจีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-490b-700c-8b8d-7e9dc57452be"), "HK", "HKG", "Hong Kong", "ฮ่องกง", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-490c-700d-941a-c2abf96ef61e"), "IN", "IND", "India", "อินเดีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-490d-700e-a46d-60e309bf99db"), "ID", "IDN", "Indonesia", "อินโดนีเซีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-490e-700f-8d92-9afb072d76c8"), "IR", "IRN", "Iran", "อิหร่าน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-490f-7010-b490-22a1d191105a"), "IQ", "IRQ", "Iraq", "อิรัก", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4910-7011-829d-8d9a613bf1d2"), "IL", "ISR", "Israel", "อิสราเอล", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4911-7012-8536-62aa8abdae74"), "JP", "JPN", "Japan", "ญี่ปุ่น", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4912-7013-9fd3-3d00d568ff98"), "JO", "JOR", "Jordan", "จอร์แดน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4913-7014-802f-5d0cc3f899d3"), "KZ", "KAZ", "Kazakhstan", "คาซัคสถาน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4914-7015-af21-bebe5af9256e"), "KW", "KWT", "Kuwait", "คูเวต", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4915-7016-86a3-4a9dfd44e02f"), "KG", "KGZ", "Kyrgyzstan", "คีร์กีซสถาน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4916-7017-93e8-6dd790ec81a7"), "LA", "LAO", "Laos", "ลาว", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4917-7018-9538-929f78dcc73b"), "LB", "LBN", "Lebanon", "เลบานอน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4918-7019-ab0c-1213117b95c9"), "MO", "MAC", "Macau", "มาเก๊า", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4919-701a-bf1d-70e2e48793d4"), "MY", "MYS", "Malaysia", "มาเลเซีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-491a-701b-9e93-1f474c2f33a9"), "MV", "MDV", "Maldives", "มัลดีฟส์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-491b-701c-b0ae-40f18b285830"), "MN", "MNG", "Mongolia", "มองโกเลีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-491c-701d-b478-edb9c4f04efe"), "MM", "MMR", "Myanmar", "เมียนมา", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-491d-701e-9fc9-7578f51a9789"), "NP", "NPL", "Nepal", "เนปาล", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-491e-701f-834a-9591d4cee3cf"), "KP", "PRK", "North Korea", "เกาหลีเหนือ", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-491f-7020-86b4-f71e10260b76"), "OM", "OMN", "Oman", "โอมาน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4920-7021-a2ff-f5b756094ed5"), "PK", "PAK", "Pakistan", "ปากีสถาน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4921-7022-b949-501ce5283228"), "PS", "PSE", "Palestine", "ปาเลสไตน์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4922-7023-b394-9108f1336aed"), "PH", "PHL", "Philippines", "ฟิลิปปินส์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4923-7024-91f5-8c20b619eff4"), "QA", "QAT", "Qatar", "กาตาร์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4924-7025-be86-47edd4ce856d"), "SA", "SAU", "Saudi Arabia", "ซาอุดีอาระเบีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4925-7026-89c5-8a55f3f8492e"), "SG", "SGP", "Singapore", "สิงคโปร์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4926-7027-9791-5aef69e61e9d"), "KR", "KOR", "South Korea", "เกาหลีใต้", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4927-7028-9081-d1770e380b83"), "LK", "LKA", "Sri Lanka", "ศรีลังกา", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4928-7029-a555-960be3118d6e"), "SY", "SYR", "Syria", "ซีเรีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4929-702a-a10e-65af1418cdec"), "TW", "TWN", "Taiwan", "ไต้หวัน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-492a-702b-bd2e-bf4025026428"), "TJ", "TJK", "Tajikistan", "ทาจิกิสถาน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-492b-702c-a241-23a2b3502ebf"), "TL", "TLS", "Timor-Leste", "ติมอร์-เลสเต", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-492c-702d-bc71-e3626a4db350"), "TR", "TUR", "Turkey", "ตุรกี", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-492d-702e-83a7-47ba94aa42d2"), "TM", "TKM", "Turkmenistan", "เติร์กเมนิสถาน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-492e-702f-8471-637a151f1120"), "AE", "ARE", "United Arab Emirates", "สหรัฐอาหรับเอมิเรตส์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-492f-7030-9629-4cce8d45ebcf"), "UZ", "UZB", "Uzbekistan", "อุซเบกิสถาน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4930-7031-999d-d5986f82c772"), "VN", "VNM", "Vietnam", "เวียดนาม", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4931-7032-b0bb-88beeda7fa94"), "YE", "YEM", "Yemen", "เยเมน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },

            // --- EUROPE ---
            { new Guid("019e255b-4932-7033-8509-b6ad7130a84f"), "AL", "ALB", "Albania", "แอลเบเนีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4933-7034-9034-330d9f08c930"), "AD", "AND", "Andorra", "อันดอร์รา", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4934-7035-82fe-3e1adddad37d"), "AT", "AUT", "Austria", "ออสเตรีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4935-7036-9393-5863eeb073a3"), "BY", "BLR", "Belarus", "เบลารุส", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4936-7037-b2c7-3cba25913421"), "BE", "BEL", "Belgium", "เบลเยียม", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4937-7038-b554-85124a5a880c"), "BA", "BIH", "Bosnia and Herzegovina", "บอสเนียและเฮอร์เซโกวีนา", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4938-7039-9eec-93588f3825e0"), "BG", "BGR", "Bulgaria", "บัลแกเรีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4939-703a-b61a-713e378c8564"), "HR", "HRV", "Croatia", "โครเอเชีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-493a-703b-80f1-34f0849c8258"), "CZ", "CZE", "Czech Republic", "สาธารณรัฐเช็ก", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-493b-703c-bcca-d32c72ba3678"), "DK", "DNK", "Denmark", "เดนมาร์ก", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-493c-703d-b4a6-c00ded0869af"), "EE", "EST", "Estonia", "เอสโตเนีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-493d-703e-9955-c225d324884d"), "FI", "FIN", "Finland", "ฟินแลนด์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-493e-703f-b365-d5da2e0ac4b3"), "FR", "FRA", "France", "ฝรั่งเศส", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-493f-7040-b09a-cccff56eb380"), "DE", "DEU", "Germany", "เยอรมนี", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4940-7041-b7b5-687cdb33346c"), "GR", "GRC", "Greece", "กรีซ", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4941-7042-bd7b-17841e8f5073"), "HU", "HUN", "Hungary", "ฮังการี", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4942-7043-a54a-0778d886043f"), "IS", "ISL", "Iceland", "ไอซ์แลนด์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4943-7044-a9a2-abdbc4bd6b14"), "IE", "IRL", "Ireland", "ไอร์แลนด์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4944-7045-a786-9a7c152d18f5"), "IT", "ITA", "Italy", "อิตาลี", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4945-7046-8237-d2415c7353ce"), "LV", "LVA", "Latvia", "ลัตเวีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4946-7047-83ce-2b3e374aacb0"), "LI", "LIE", "Liechtenstein", "ลิกเตนสไตน์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4947-7048-9fdd-2ca059a0e772"), "LT", "LTU", "Lithuania", "ลิทัวเนีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4948-7049-a4fb-cf6eba13f5a8"), "LU", "LUX", "Luxembourg", "ลักเซมเบิร์ก", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4949-704a-b490-7eb07dccc67e"), "MT", "MLT", "Malta", "มอลตา", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-494a-704b-ab6c-b92687a7f69a"), "MC", "MCO", "Monaco", "โมนาโก", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-494b-704c-aae4-b0a5ed1bda84"), "ME", "MNE", "Montenegro", "มอนเตเนโกร", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-494c-704d-912f-ea6e824cf3cf"), "NL", "NLD", "Netherlands", "เนเธอร์แลนด์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-494d-704e-a709-7ae11cb4b0ee"), "NO", "NOR", "Norway", "นอร์เวย์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-494e-704f-a977-3ac9160de28e"), "PL", "POL", "Poland", "โปแลนด์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-494f-7050-a87e-5dff11e19c47"), "PT", "PRT", "Portugal", "โปรตุเกส", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4950-7051-8444-7e48a1610457"), "RO", "ROU", "Romania", "โรมาเนีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4951-7052-a381-08d68aee8f1c"), "RU", "RUS", "Russia", "รัสเซีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4952-7053-ab57-807e599eb7be"), "SM", "SMR", "San Marino", "ซานมารีโน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4953-7054-9b2b-3a8597549afc"), "RS", "SRB", "Serbia", "เซอร์เบีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4954-7055-ae5a-88add05e86d6"), "SK", "SVK", "Slovakia", "สโลวาเกีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4955-7056-ae90-f3caa4b0c240"), "SI", "SVN", "Slovenia", "สโลวีเนีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4956-7057-9775-10cb62dfbb8b"), "ES", "ESP", "Spain", "สเปน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4957-7058-a1ab-acbb124babcd"), "SE", "SWE", "Sweden", "สวีเดน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4958-7059-916e-28f264a9ebec"), "CH", "CHE", "Switzerland", "สวิตเซอร์แลนด์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4959-705a-a540-666df5f5cea5"), "UA", "UKR", "Ukraine", "ยูเครน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-495a-705b-9e9a-184a56e008de"), "GB", "GBR", "United Kingdom", "สหราชอาณาจักร", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-495b-705c-924c-b7d21f423229"), "VA", "VAT", "Vatican City", "นครรัฐวาติกัน", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },

            // --- AMERICAS ---
            { new Guid("019e255b-495c-705d-97fa-422537f7c04e"), "AR", "ARG", "Argentina", "อาร์เจนตินา", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-495d-705e-bb40-ad9651e9ef4e"), "BR", "BRA", "Brazil", "บราซิล", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-495e-705f-ba60-15c5a23dcb7f"), "CA", "CAN", "Canada", "แคนาดา", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-495f-7060-8f03-a66740b7b954"), "CL", "CHL", "Chile", "ชิลี", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4960-7061-9e1b-af9d2a1b46d4"), "CO", "COL", "Colombia", "โคลอมเบีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4961-7062-b2f4-5765b84ea8b7"), "CU", "CUB", "Cuba", "คิวบา", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4962-7063-961c-65efdc17c5ec"), "MX", "MEX", "Mexico", "เม็กซิโก", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4963-7064-b261-714d636056cd"), "PE", "PER", "Peru", "เปรู", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4964-7065-b3bc-061a8cf7187f"), "US", "USA", "United States", "สหรัฐอเมริกา", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },

            // --- OCEANIA ---
            { new Guid("019e255b-4965-7066-8679-8cf0155fb995"), "AU", "AUS", "Australia", "ออสเตรเลีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4966-7067-9fd4-69fcbbfe9223"), "FJ", "FJI", "Fiji", "ฟีจี", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4967-7068-b5fe-4207333c852e"), "NZ", "NZL", "New Zealand", "นิวซีแลนด์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },

            // --- AFRICA ---
            { new Guid("019e255b-4968-7069-8424-ec6b20688c37"), "EG", "EGY", "Egypt", "อียิปต์", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-4969-706a-8fc9-5d19b4e64e31"), "KE", "KEN", "Kenya", "เคนยา", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-496a-706b-babd-6dfea88b477a"), "MA", "MAR", "Morocco", "โมร็อกโก", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-496b-706c-83be-ea64fec05369"), "NG", "NGA", "Nigeria", "ไนจีเรีย", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
            { new Guid("019e255b-496c-706d-b661-2d80961866ed"), "ZA", "ZAF", "South Africa", "แอฟริกาใต้", false, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null }
                });

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
