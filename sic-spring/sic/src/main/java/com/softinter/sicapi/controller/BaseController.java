package com.softinter.sicapi.controller;

import com.softinter.sicapi.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public abstract class BaseController {

    protected final CurrentUserService currentUserService;
}
