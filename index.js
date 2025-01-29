import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const path = "./data.json";

const makeCommits = (n) => {
    if(n === 0) return simpleGit().push();
    
    // Much higher chance of activity
    const dayType = random.int(1, 100);
    let commitsPerDay;
    let commitMessage;
    
    if (dayType <= 15) {
        // Very heavy development day (15% chance) - 20-30 commits
        commitsPerDay = random.int(20, 30);
        commitMessage = "feat: Major development - ";
    } else if (dayType <= 45) {
        // Active development day (30% chance) - 10-19 commits
        commitsPerDay = random.int(10, 19);
        commitMessage = "feat: Active development - ";
    } else if (dayType <= 85) {
        // Regular work day (40% chance) - 4-9 commits
        commitsPerDay = random.int(4, 9);
        commitMessage = "feat: Regular updates - ";
    } else {
        // Light day (15% chance) - 1-3 commits
        commitsPerDay = random.int(1, 3);
        commitMessage = "fix: Minor changes - ";
    }
    
    // Concentrate on the last year with occasional older commits
    const yearsBack = random.int(0, 100) <= 90 ? 0 : 1;  // 90% chance of being in the last year
    const daysBack = random.int(0, 364);
    
    const baseDate = moment()
        .subtract(yearsBack, "y")
        .subtract(daysBack, "d");
    
    // Create commits throughout the day with focus on work hours
    for(let i = 0; i < commitsPerDay; i++) {
        // Concentrate commits during work hours (10 AM - 7 PM)
        const hour = random.int(10, 19);
        const minute = random.int(0, 59);
        
        const date = baseDate
            .clone()
            .add(hour, "h")
            .add(minute, "m");

        // Skip if date is in the future
        if (date.isAfter(moment())) {
            continue;
        }
        
        // More focused commit messages for consistency
        const messages = [
            "Update",
            "Enhance",
            "Improve",
            "Optimize",
            "Refactor",
            "Add features to",
            "Fix issues in",
            "Implement changes in"
        ];
        
        const components = [
            "core functionality",
            "user interface",
            "backend services",
            "API endpoints",
            "database schema",
            "authentication system",
            "monitoring tools",
            "deployment process",
            "documentation",
            "test suite"
        ];
        
        const details = [
            "for better performance",
            "for improved reliability",
            "to enhance user experience",
            "to fix reported issues",
            "based on user feedback",
            "to meet requirements",
            "for better stability"
        ];
        
        const message = `${commitMessage}${random.choice(messages)} ${random.choice(components)} ${random.choice(details)}`;
            
        jsonfile.writeFile(path, { 
            date: date.format(),
            type: dayType <= 45 ? "major_development" : "regular_work",
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

// Generate more commits to match the density
makeCommits(3000);