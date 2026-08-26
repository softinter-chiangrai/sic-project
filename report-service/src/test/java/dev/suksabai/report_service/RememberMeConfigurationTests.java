package dev.suksabai.report_service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
	"app.security.remember-me.days=7",
	"app.security.remember-me.key=test-remember-me-key"
})
@ActiveProfiles("test")
@AutoConfigureMockMvc
class RememberMeConfigurationTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void loginShouldUseConfiguredRememberMeDaysForCookieMaxAge() throws Exception {
		mockMvc.perform(post("/login")
				.with(csrf())
				.param("username", "admin")
				.param("password", "admin")
				.param("remember-me", "on"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/"))
			.andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.allOf(
				org.hamcrest.Matchers.containsString("remember-me="),
				org.hamcrest.Matchers.containsString("Max-Age=604800")
			)));
	}
}