<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Lightweight front controller router.
 *
 * Supports:
 *  - Exact path matching          GET /api/exercises
 *  - Named path parameters        GET /api/exercises/{id}
 *  - Multiple HTTP methods        match(['GET','PUT'], ...)
 *  - Callable or [Class, method] handlers
 */
class Router
{
    private array $routes = [];

    public function get(string $path, array|callable $handler): self
    {
        return $this->add('GET', $path, $handler);
    }

    public function post(string $path, array|callable $handler): self
    {
        return $this->add('POST', $path, $handler);
    }

    public function put(string $path, array|callable $handler): self
    {
        return $this->add('PUT', $path, $handler);
    }

    public function delete(string $path, array|callable $handler): self
    {
        return $this->add('DELETE', $path, $handler);
    }

    /**
     * Register the same handler for multiple HTTP methods.
     *
     * @param string[] $methods
     */
    public function match(array $methods, string $path, array|callable $handler): self
    {
        foreach ($methods as $method) {
            $this->add(strtoupper($method), $path, $handler);
        }

        return $this;
    }

    public function add(string $method, string $path, array|callable $handler): self
    {
        $this->routes[] = [
            'method'  => strtoupper($method),
            'path'    => $path,
            'handler' => $handler,
            'pattern' => $this->buildPattern($path),
        ];

        return $this;
    }

    public function dispatch(string $method, string $uri): void
    {
        $path   = parse_url($uri, PHP_URL_PATH) ?: '/';
        $method = strtoupper($method);

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['pattern'], $path, $matches) === 1) {
                $params = array_values(
                    array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY)
                );
                $this->callHandler($route['handler'], $params);
                return;
            }
        }

        \mm_json(['error' => 'API Endpoint Not Found'], 404);
    }

    /**
     * Convert a route path like /api/exercises/{id} into a named-capture regex.
     */
    private function buildPattern(string $path): string
    {
        $escaped = preg_quote($path, '#');
        $pattern = (string) preg_replace('/\\\{(\w+)\\\}/', '(?P<$1>[^/]+)', $escaped);

        return '#^' . $pattern . '$#';
    }

    private function callHandler(array|callable $handler, array $params): void
    {
        if (is_callable($handler)) {
            $handler(...$params);
            return;
        }

        if (is_array($handler) && count($handler) === 2) {
            [$class, $method] = $handler;
            $instance = new $class();
            $instance->$method(...$params);
        }
    }
}
