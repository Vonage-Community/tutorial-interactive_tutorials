import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val localProps = project.rootProject.file("local.properties")
val props = Properties()
props.load(localProps.inputStream())

android {
    namespace = "com.vonage.verify2.test"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.vonage.verify2.test"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        buildConfigField("String", "BACKEND_URL", "\"${props["BACKEND_URL"]}\"")
        buildConfigField("String", "PHONE_NUMBER", "\"${props["PHONE_NUMBER"]}\"")

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Compose and UI
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation(platform("androidx.compose:compose-bom:2024.11.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("com.vonage:client-library:1.0.1")

    // Networking
    implementation("com.squareup.okhttp3:okhttp:4.11.0")
    implementation("com.google.code.gson:gson:2.10.1")
}
