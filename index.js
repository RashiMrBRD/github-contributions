import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const path = "./data.json";

const makeCommits = (n) => {
    if(n === 0) return simpleGit().push();
    
    // Simulate different types of development days
    const dayType = random.int(1, 100);
    let commitsPerDay;
    let commitMessage;
    
    if (dayType <= 5) {
        // Hackathon or major feature launch (5% chance) - 25-40 commits
        commitsPerDay = random.int(25, 40);
        commitMessage = "feat: Major feature implementation - ";
    } else if (dayType <= 15) {
        // Very productive day (10% chance) - 15-25 commits
        commitsPerDay = random.int(15, 25);
        commitMessage = "feat: Intensive development - ";
    } else if (dayType <= 35) {
        // Normal productive day (20% chance) - 5-12 commits
        commitsPerDay = random.int(5, 12);
        commitMessage = "feat: Daily progress - ";
    } else if (dayType <= 60) {
        // Light work day (25% chance) - 1-4 commits
        commitsPerDay = random.int(1, 4);
        commitMessage = "fix: Minor updates - ";
    } else {
        // No activity (40% chance) - skip this iteration
        return makeCommits(n - 1);
    }
    
    // Select a date within last 3 years
    const yearsBack = random.int(0, 2);
    const daysBack = random.int(0, 364);
    
    const baseDate = moment()
        .subtract(yearsBack, "y")
        .subtract(daysBack, "d");
    
    // Create commits throughout the day
    for(let i = 0; i < commitsPerDay; i++) {
        // Distribute commits throughout working hours (9 AM - 11 PM)
        const hour = random.int(9, 23);
        const minute = random.int(0, 59);
        
        const date = baseDate
            .clone()
            .add(hour, "h")
            .add(minute, "m");

        // Skip if date is in the future
        if (date.isAfter(moment())) {
            continue;
        }
        
        // Generate realistic commit messages based on the type of work
        const messages = [
            "Add new features to",
            "Implement",
            "Update",
            "Optimize",
            "Refactor",
            "Fix bugs in",
            "Improve",
            "Enhance"
        ];
        
        const components = [
            "docker stack",
            "monitoring system",
            "media server",
            "home automation",
            "security",
            "network configuration",
            "documentation",
            "test coverage",
            "CI/CD pipeline",
            "deployment scripts"
        ];
        
        const details = [
            "for better performance",
            "to fix edge cases",
            "based on feedback",
            "to improve reliability",
            "for enhanced security",
            "to reduce complexity",
            "for better maintainability"
        ];
        
        const message = `${commitMessage}${random.choice(messages)} ${random.choice(components)} ${random.choice(details)}`;
            
        jsonfile.writeFile(path, { 
            date: date.format(),
            type: dayType <= 15 ? "major_development" : "regular_work",
            commit_number: i + 1,
            total_commits: commitsPerDay
        }, () => {
            simpleGit().add([path]).commit(
                message, 
                {"--date": date.format()}, 
                i === commitsPerDay - 1 ? () => makeCommits(n - 1) : null
            );
        });
    }
}

// Generate a large number of commits to fill the history
makeCommits(2000);