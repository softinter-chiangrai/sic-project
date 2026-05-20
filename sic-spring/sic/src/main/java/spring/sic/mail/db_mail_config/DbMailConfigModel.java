package spring.sic.mail.db_mail_config;

import java.time.OffsetDateTime;
import java.util.UUID;

public class DbMailConfigModel {
    private UUID id;
    private String configName;
    private String smtpServer;
    private Integer smtpPort;
    private String sslType;
    private String username;
    private String password;
    private Boolean enableSsl;
    private Boolean status;
    private Integer sortOrder;
    private Boolean isActive;
    private Integer maxRetry;
    private String description;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getConfigName() {
        return configName;
    }

    public void setConfigName(String configName) {
        this.configName = configName;
    }

    public String getSmtpServer() {
        return smtpServer;
    }

    public void setSmtpServer(String smtpServer) {
        this.smtpServer = smtpServer;
    }

    public Integer getSmtpPort() {
        return smtpPort;
    }

    public void setSmtpPort(Integer smtpPort) {
        this.smtpPort = smtpPort;
    }

    public String getSslType() {
        return sslType;
    }

    public void setSslType(String sslType) {
        this.sslType = sslType;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getEnableSsl() {
        return enableSsl;
    }

    public void setEnableSsl(Boolean enableSsl) {
        this.enableSsl = enableSsl;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Integer getMaxRetry() {
        return maxRetry;
    }

    public void setMaxRetry(Integer maxRetry) {
        this.maxRetry = maxRetry;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public OffsetDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(OffsetDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public OffsetDateTime getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(OffsetDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }

    public Boolean getIsDelete() {
        return isDelete;
    }

    public void setIsDelete(Boolean isDelete) {
        this.isDelete = isDelete;
    }

    public String getDeleteBy() {
        return deleteBy;
    }

    public void setDeleteBy(String deleteBy) {
        this.deleteBy = deleteBy;
    }

    public OffsetDateTime getDeleteDate() {
        return deleteDate;
    }

    public void setDeleteDate(OffsetDateTime deleteDate) {
        this.deleteDate = deleteDate;
    }

    @Override
    public String toString() {
        return "DbMailConfigModel [id=" + id + ", configName=" + configName + ", smtpServer=" + smtpServer
                + ", smtpPort=" + smtpPort + ", sslType=" + sslType + ", username=" + username + ", password="
                + password + ", enableSsl=" + enableSsl + ", status=" + status + ", sortOrder=" + sortOrder
                + ", isActive=" + isActive + ", maxRetry=" + maxRetry + ", description=" + description
                + ", createdBy=" + createdBy + ", createdDate=" + createdDate + ", updatedBy=" + updatedBy
                + ", updatedDate=" + updatedDate + ", isDelete=" + isDelete + ", deleteBy=" + deleteBy
                + ", deleteDate=" + deleteDate + "]";
    }

}