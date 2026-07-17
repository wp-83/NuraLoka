<?php

// Error page (Error/Index), per HTTP status code.
return [
    'titles' => [
        400 => 'Bad Request',
        401 => 'Unauthenticated',
        403 => 'Access Denied',
        404 => 'Page Not Found',
        405 => 'Method Not Allowed',
        408 => 'Request Timeout',
        419 => 'Session Expired',
        500 => 'Server Error',
        502 => 'Bad Gateway',
        503 => 'Service Unavailable',
    ],
    'descriptions' => [
        400 => 'The request could not be understood by the server.',
        401 => 'You need to sign in to access this page.',
        403 => 'You do not have permission to access this page.',
        404 => 'The page you are looking for could not be found.',
        405 => 'The request method used is not allowed for this page.',
        408 => 'The server timed out waiting for your request.',
        419 => 'Your session has expired. Please reload the page and try again.',
        500 => 'Oops, something went wrong on our server.',
        502 => 'The server received an invalid response.',
        503 => 'Sorry, the service is temporarily unavailable.',
    ],
];
