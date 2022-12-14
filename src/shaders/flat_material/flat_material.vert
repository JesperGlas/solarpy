struct Light
{
    // 1=AMBIENT, 2=DIRECTIONAL, 3=POINT
    int lightType;
    // used by all light
    vec3 color;
    // used by directional light
    vec3 direction;
    // used by point light
    vec3 position;
    vec3 attenuation;
};

uniform Light u_light0;
uniform Light u_light1;
uniform Light u_light2;
uniform Light u_light3;

vec3 lightCalc(Light light, vec3 point_position, vec3 point_normal)
{
    float ambient = 0;
    float diffuse = 0;
    float specular = 0;
    float attenuation = 1;
    vec3 light_direction = vec3(0, 0, 0);
    
    if (light.lightType == 1)  // ambient light
    {
        ambient = 1;
    }
    else if (light.lightType == 2)  // directional light 
    {
        light_direction = normalize(light.direction);
    }
    else if (light.lightType == 3)  // point light 
    {
        light_direction = normalize(point_position - light.position);
        float distance = length(light.position - point_position);
        attenuation = 1.0 / (light.attenuation[0] 
                            + light.attenuation[1] * distance 
                            + light.attenuation[2] * distance * distance);
    }
    
    if (light.lightType > 1)  // directional or point light
    {
        point_normal = normalize(point_normal);
        diffuse = max(dot(point_normal, -light_direction), 0.0);
        diffuse *= attenuation;
    }
    return light.color * (ambient + diffuse + specular);
}

uniform mat4 u_proj;
uniform mat4 u_view;
uniform mat4 u_model;
in vec3 a_position;
in vec2 a_texCoords;
in vec3 a_fNormal;
out vec2 v_texCoords;
out vec3 v_light;

void main()
{
    gl_Position = u_proj * u_view * u_model * vec4(a_position, 1.0);
    v_texCoords = a_texCoords;
    
    vec3 position = vec3(u_model * vec4(a_position, 1));
    vec3 normal = normalize(mat3(u_model) * a_fNormal);
    v_light = vec3(0, 0, 0);
    v_light += lightCalc(u_light0, position, normal);
    v_light += lightCalc(u_light1, position, normal);
    v_light += lightCalc(u_light2, position, normal);
    v_light += lightCalc(u_light3, position, normal);
}