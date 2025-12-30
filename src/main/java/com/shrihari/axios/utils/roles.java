package com.shrihari.axios.utils;

public class roles {
    public enum ROLES{
        Patient("Patient"),
        Doctor("Doctor"),
        Pharmacist("Pharamcist");
        private String RoleValue;
        private ROLES(String RoleValue){
            this.RoleValue = RoleValue;
        }
public String getRoleValue(){
            return RoleValue;
}
    }
}
