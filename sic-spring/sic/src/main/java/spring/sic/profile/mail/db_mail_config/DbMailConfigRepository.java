package spring.sic.profile.mail.db_mail_config;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DbMailConfigRepository extends JpaRepository<DbMailConfigEntity, UUID> {
}