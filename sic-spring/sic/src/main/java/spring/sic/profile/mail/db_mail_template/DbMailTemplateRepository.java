package spring.sic.profile.mail.db_mail_template;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface DbMailTemplateRepository extends JpaRepository<DbMailTemplateEntity, UUID> {
}