plugins {
    kotlin("jvm") version "1.9.25"
}

group = "PhantasyIslandKotlinRemoteControl"
version = "0.1.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation(kotlin("stdlib"))
    implementation("org.json:json:20240303")
    implementation("io.socket:socket.io-client:2.1.1")
}

kotlin {
    jvmToolchain(17)
}


sourceSets {
    main {
        kotlin.srcDirs(".")
    }
    test {
        kotlin.srcDirs("test")
    }
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    compilerOptions {
        freeCompilerArgs.add("-Xjsr305=strict")
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

