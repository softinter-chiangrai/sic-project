package spring.sic.mail.db_mail_queue;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface DbMailQueueRepository extends JpaRepository<DbMailQueueEntity, UUID> {
}