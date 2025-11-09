'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the old foreign key constraint if it exists
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE "daily_tip_logs" 
        DROP CONSTRAINT IF EXISTS "daily_tip_logs_baseTipId_fkey";
      `);
    } catch (error) {
      console.log('No existing constraint to drop:', error.message);
    }

    // Add new foreign key constraint to coach_tips
    await queryInterface.sequelize.query(`
      ALTER TABLE "daily_tip_logs" 
      ADD CONSTRAINT "daily_tip_logs_baseTipId_fkey" 
      FOREIGN KEY ("baseTipId") 
      REFERENCES "coach_tips"("id") 
      ON DELETE SET NULL 
      ON UPDATE CASCADE;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop the coach_tips foreign key
    await queryInterface.sequelize.query(`
      ALTER TABLE "daily_tip_logs" 
      DROP CONSTRAINT IF EXISTS "daily_tip_logs_baseTipId_fkey";
    `);

    // Restore the old foreign key to tips
    await queryInterface.sequelize.query(`
      ALTER TABLE "daily_tip_logs" 
      ADD CONSTRAINT "daily_tip_logs_baseTipId_fkey" 
      FOREIGN KEY ("baseTipId") 
      REFERENCES "tips"("id") 
      ON DELETE SET NULL 
      ON UPDATE CASCADE;
    `);
  },
};

