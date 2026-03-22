<?php

namespace App\Core;

class Router {
    private $routes = [];

    public function add($method, $path, $handler) {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }

    public function dispatch($method, $uri) {
        $parsedUri = parse_url($uri, PHP_URL_PATH);
        
        foreach ($this->routes as $route) {
            if ($route['method'] === $method && $route['path'] === $parsedUri) {
                $handler = $route['handler'];
                
                if (is_callable($handler)) {
                    return $handler();
                }

                if (is_array($handler) && count($handler) === 2) {
                    $controllerName = $handler[0];
                    $methodName = $handler[1];
                    $controller = new $controllerName();
                    return $controller->$methodName();
                }
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Not Found']);
    }
}
