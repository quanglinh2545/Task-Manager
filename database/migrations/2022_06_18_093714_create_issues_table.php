<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateIssuesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('issues', function (Blueprint $table) {
            $table->id();
            $table->string('subject', 255);
            $table->text('description', 1024)->nullable();
            $table->foreignId('project_id')->nullable()
                ->constrained('projects')->cascadeOnDelete();
            $table->foreignId('assignee_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->foreignId('user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->foreignId('type_id')->nullable()
                ->constrained('issue_types')->nullOnDelete();
            $table->timestamp('due_date')->nullable();
            $table->timestamp('start_date')->nullable();
            $table->double('estimate_time', 20, 2)->default(0);
            $table->double('spent_time', 20, 2)->default(0);
            $table->smallInteger('percent_complete')->default(0);
            $table->string('status', 32)->default('Open');
            $table->string('priority', 32)->default('normal');
            $table->string('level', 32)->default('normal');
            $table->string('tracker', 32)->default('feature');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('issues');
    }
}
