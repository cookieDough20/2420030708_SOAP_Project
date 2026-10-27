package com.ai_orchestrator.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class FastApiPrediction {
    
    @JsonProperty("priority")
    private String priority;
    
    @JsonProperty("urgency_score")
    private Double urgency_score;
    
    @JsonProperty("recommended_action")
    private String recommended_action;
    
    @JsonProperty("recommended_ngo")
    private String recommended_ngo;
    
    @JsonProperty("recommended_ngo_id")
    private Long recommended_ngo_id;
    
    @JsonProperty("estimated_people_served")
    private Integer estimated_people_served;
    
    @JsonProperty("risk_level")
    private String risk_level;
    
    @JsonProperty("explanation")
    private String explanation;

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    
    public Double getUrgency_score() { return urgency_score; }
    public void setUrgency_score(Double urgency_score) { this.urgency_score = urgency_score; }
    
    public String getRecommended_action() { return recommended_action; }
    public void setRecommended_action(String recommended_action) { this.recommended_action = recommended_action; }
    
    public String getRecommended_ngo() { return recommended_ngo; }
    public void setRecommended_ngo(String recommended_ngo) { this.recommended_ngo = recommended_ngo; }
    
    public Long getRecommended_ngo_id() { return recommended_ngo_id; }
    public void setRecommended_ngo_id(Long recommended_ngo_id) { this.recommended_ngo_id = recommended_ngo_id; }
    
    public Integer getEstimated_people_served() { return estimated_people_served; }
    public void setEstimated_people_served(Integer estimated_people_served) { this.estimated_people_served = estimated_people_served; }
    
    public String getRisk_level() { return risk_level; }
    public void setRisk_level(String risk_level) { this.risk_level = risk_level; }
    
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
